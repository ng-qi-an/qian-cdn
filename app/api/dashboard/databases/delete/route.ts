import { deleteFiles } from "@/lib/actions/files/deleteFiles";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyUser } from "@/lib/permissions/serverPermissionHelpers";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { databases } from "@/lib/schema/schema";
import { DeleteBucketCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";

export const DELETE = verifyUser(async(req: Request, ctx, user) => {
    const data = await req.json();
    const viewAllPerms = await userHasPermissionServer({databases: ['viewAll']}, user);
    const dbData = await db.query.databases.findFirst({
        where: { id: data.dbId, ownerId: viewAllPerms.isAuthorised ? {isNotNull: true} : user.id },
        with: {
            files: {
                columns: {
                    id: true,
                    key: true
                }
            }
        }
    })
    if (!dbData) {
        return errorToResponse(new NotFoundError("Database is not found or you do not have permission to delete it."));
    }
    try {
        if (dbData.files.length > 0) {
            await deleteFiles({filesFromDb: dbData.files, keys: dbData.keys, provider: dbData.provider});
        }
        console.log("Deleted", dbData.files.length, "files from database", dbData.id);
        await db.delete(databases).where(eq(databases.id, dbData.id));
        if (dbData.provider == "cloudflare-r2" || dbData.provider == "amazon-s3") {
            const client = getS3Client(dbData.keys.accessUrl, dbData.keys.accessKeyId, dbData.keys.secretAccessKey);
            try {
                const r = await client.send(new DeleteBucketCommand({ Bucket: dbData.keys.bucketName }));
                console.log("Delete bucket response meta:", r.$metadata);
                if (r.$metadata.httpStatusCode != 204){
                    console.log("Failed delete due to bad http code")
                    return errorToResponse(new InvalidConfigurationError("Your database has already been deleted, but something went wrong when deleting the bucket. Delete the bucket manually instead."));
                }
            } catch (error) {
                if (isCredentialError(error) || error instanceof Error && (error.message.includes("ENOTFOUND") || error.name == "InvalidArgument")) {
                    return errorToResponse(new InvalidConfigurationError("Your database has already been deleted, but something went wrong when deleting the bucket. Delete the bucket manually instead."));
                } else if (error instanceof Error && error.name == "BucketNotEmpty"){
                    return errorToResponse(new InvalidConfigurationError("Your database has already been deleted, but there are orphaned files in your bucket. Delete your bucket manually instead."));
                } else {
                    console.error(error);
                    return errorToResponse(error);
                }
            }
        }
        return Response.json({message: "Database deleted successfully!"}, {status: 200});
    } catch (error) {
        console.error("Error deleting database:", error);
        return errorToResponse(error);
    }
})