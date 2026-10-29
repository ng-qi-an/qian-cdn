import { deleteFiles } from "@/lib/actions/files/deleteFiles";
import { makeAuditLog } from "@/lib/actions/logs/makeAuditLog";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyUser } from "@/lib/permissions/serverPermissionHelpers";
import { applications } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";

export const DELETE = verifyUser(async(req: Request, ctx, user) => {
    const data = await req.json();
    const viewAllPerms = await userHasPermissionServer({applications: ['viewAll']}, user);
    const appData = await db.query.applications.findFirst({
        where: { id: data.appId, ownerId: viewAllPerms.isAuthorised ? {isNotNull: true} : user.id },
        with: {
            database: {
                columns: {
                    provider: true,
                    keys: true,
                    id: true,
                    name: true
                }
            },
            files: {
                columns: {
                    id: true,
                    key: true
                }
            }
        }
    })
    if (!appData) {
        return errorToResponse(new NotFoundError("Application is not found or you do not have permission to delete it."));
    }
    try {
        if (appData.database){
            if (appData.files.length > 0) {
                await deleteFiles({filesFromDb: appData.files, keys: appData.database?.keys, provider: appData.database?.provider ?? ""});
            }
        }
        await db.delete(applications).where(eq(applications.id, appData.id));
        await makeAuditLog({userId: user.id, code: "APPLICATION_DELETED", data: {application: {id: appData.id, name: appData.name}, database: {id: appData.database?.id ?? "undefined", name: appData.database?.name ?? "Unknown database"}}});
        return Response.json({message: "Application deleted successfully!"}, {status: 200});
    } catch (error) {
        console.error("Error deleting app:", error);
        return errorToResponse(error);
    }
})