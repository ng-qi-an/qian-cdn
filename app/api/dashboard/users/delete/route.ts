import { deleteFiles } from "@/lib/actions/files/deleteFiles";
import { makeAuditLog } from "@/lib/actions/logs/makeAuditLog";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { InsufficientPermissionsError, InvalidConfigurationError, NotFoundError } from "@/lib/errors";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";
import { errorToResponse, userHasPermissionServer, verifyUser } from "@/lib/permissions/serverPermissionHelpers";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { applications, databases } from "@/lib/schema/schema";
import { DeleteBucketCommand } from "@aws-sdk/client-s3";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export const DELETE = verifyUser(async(req: Request, ctx, user) => {
    const deleteUserPerms = await userHasPermissionServer({user: ["delete"]}, user);
    if (!deleteUserPerms.isAuthorised) {
        return errorToResponse(new InsufficientPermissionsError("You do not have permission to delete users."));
    }
    const data = await req.json();
    if (!data.userId) {
        return errorToResponse(new InsufficientPermissionsError("No user ID provided."));
    }
    const targetUserId = data.userId;
    if (targetUserId === user.id) {
        return errorToResponse(new InsufficientPermissionsError("You cannot delete yourself."));
    }
    const targetUser = await db.query.user.findFirst({
        where: {
            id: targetUserId
        },
        with: {
            applications: {
                with: {
                    files: {
                        columns: {
                            id: true,
                            key: true
                        }
                    },
                    database: {
                        columns: {
                            keys: true,
                            provider: true
                        }
                    }
                }
            },
            databases: {
                with: {
                    files: {
                        columns: {
                            id: true,
                            key: true
                        }
                    }
                }
            }
        }
    })
    if (!targetUser) {
        return errorToResponse(new NotFoundError("User not found."));
    }
    if (!checkUserHasHigherPerms(user.role!, targetUser.role!)) {
        return errorToResponse(new InsufficientPermissionsError("You do not have permission to delete this user."));
    }
    // Delete user applications first
    let deletedFiles: string[] = []
    const appResponse = await Promise.all(targetUser.applications.map(async (app) => {
        try {
            if (app.files.length > 0 && app.database) {
                const {deleted} = await deleteFiles({filesFromDb: app.files, keys: app.database.keys, provider: app.database.provider});
                deletedFiles = [...deletedFiles, ...deleted];
                if (deleted.length < app.files.length){
                    console.log("Some files could not be deleted for app", app.name);
                    await db.delete(applications).where(eq(applications.id, app.id));
                    return {status: "warning", message: `Could not delete the files for app ${app.name}. The bucket is at ${app.database.keys.bucketName} on ${app.database.provider}`};
                }
            }
            await db.delete(applications).where(eq(applications.id, app.id));
            return {status: "success", message: `Application ${app.name} deleted successfully.`};
        
        } catch (error) {
            console.error("Error deleting user applications:", error);
            return {status: "error", message: `Could not delete the application ${app.name}. Error: ${error instanceof Error ? error.message : "Unknown error"}`};
        }
    }))
    if (appResponse.some(r => r.status === "error")){
        return Response.json({error: "FAILED_DELETE_APP_OBJECTS", message: "Some applications could not be deleted. Check details for exact failures.", details: appResponse}, {status: 500});
    }
    // Delete user databases
    const response: {status: "success" | "warning" | "error", message: string}[] = await Promise.all(targetUser.databases.map(async (database) => {
        try {
            let promiseResponse: {status: "success" | "warning" | "error", message: string} = {status: "success", message: "Database items deleted successfully."};
            const remainingFiles = database.files.filter((file)=> !deletedFiles.includes(file.id));
            if (remainingFiles.length > 0) {
                const {deleted} = await deleteFiles({filesFromDb: remainingFiles, keys: database.keys, provider: database.provider});
                if (deleted.length < remainingFiles.length){
                    console.log("Some files could not be deleted for database", database.id);
                    promiseResponse = {status: "warning", message: `Could not delete the files for database ${database.name}. The bucket is at ${database.keys.bucketName} on ${database.provider}`};
                }
            }
            if (promiseResponse.status == "success"){
                if (database.provider == "cloudflare-r2" || database.provider == "amazon-s3") {
                    const client = getS3Client(database.keys.accessUrl, database.keys.accessKeyId, database.keys.secretAccessKey);
                    try {
                        const r = await client.send(new DeleteBucketCommand({ Bucket: database.keys.bucketName }));
                        console.log("Delete bucket response meta:", r.$metadata);
                        if (r.$metadata.httpStatusCode != 204){
                            promiseResponse = {status: "warning", message: `Could not delete the bucket ${database.keys.bucketName} on ${database.provider} for DB ${database.name}. Delete the bucket manually instead.`};
                        }
                    } catch (error) {
                        if (isCredentialError(error) || error instanceof Error && (error.message.includes("ENOTFOUND") || error.name == "InvalidArgument")) {
                            promiseResponse = {status: "warning", message: `Could not delete the bucket ${database.keys.bucketName} on ${database.provider} for DB ${database.name}. Delete the bucket manually instead.`};
                        } else if (error instanceof Error && error.name == "BucketNotEmpty"){
                            promiseResponse = {status: "warning", message: `Could not delete the bucket ${database.keys.bucketName} on ${database.provider} for DB ${database.name}. There are still extra files in your bucket. Delete your bucket manually instead.`};
                        } else {
                            console.error("Unknown error deleting bucket:", error);
                            if (error instanceof Error) {
                                promiseResponse = {status: "error", message: error.message};
                            } else {
                                promiseResponse = {status: "error", message: "An unknown error occurred."};
                            }
                        }
                    }
                }
            }
            if (promiseResponse && promiseResponse.status == "error") {
                return promiseResponse;
            }
            try {
                await db.delete(databases).where(and(eq(databases.id, database.id), eq(databases.ownerId, targetUserId)));
            } catch (error) {
                return {status: "error", message: `Could not delete the database ${database.name} from the database. The bucket has been deleted. Error: ${error instanceof Error ? error.message : "Unknown error"}`};
            }
            return promiseResponse;
        } catch (error) {
            console.error("Error deleting files for database", database.id, ":", error);
            return {status: "error", message: `Could not delete the files for database ${database.name}. The bucket is at ${database.keys.bucketName} on ${database.provider}. Error: ${error instanceof Error ? error.message : "Unknown error"}`};
        }
    }))
    const combinedResponse = [...appResponse, ...response];
    if (combinedResponse.some(r => r.status === "error")){
        return Response.json({error: "FAILED_DELETE_DB_OBJECTS", message: "Some databases/applications could not be deleted. Check details for exact failures.", details: combinedResponse}, {status: 500});
    }
    const deleteRes = await auth.api.removeUser({
        body: {
            userId: targetUserId,
        },
        headers: await headers(),
    });
    if (!deleteRes.success) {
        return Response.json({error: "FAILED_DELETE_USER", message: "Could not delete the user. No error is provided.", details: combinedResponse}, {status: 500});
    }
    await makeAuditLog({userId: user.id, code: "USER_DELETED", data: {user: {id: targetUser.id, name: targetUser.name}}});
    return Response.json({status: "success", message: "User and associated databases/applications deleted successfully.", details: combinedResponse}, {status: 200});
})