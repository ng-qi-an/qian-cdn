import { makeAppLog } from "@/lib/actions/logs/appLog";
import { makeAuditLog } from "@/lib/actions/logs/makeAuditLog";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyUser } from "@/lib/permissions/serverPermissionHelpers";
import { applications } from "@/lib/schema/schema";
import { and, eq, isNotNull } from "drizzle-orm";

export const PATCH = verifyUser(async(req: Request, ctx, user) => {
    const data = await req.json();
    const requiredKeys = ["name", "appId", "description", "limit", "usageAlert"]
    if (requiredKeys.filter(key => !Object.keys(data).includes(key)).length > 0) {
        console.log("Missing required keys. Expected:", requiredKeys, "Got:", Object.keys(data));
        return errorToResponse(new InvalidConfigurationError("Some required fields are missing or invalid."));
    }
    const viewAllPerms = await userHasPermissionServer({applications: ['viewAll']}, user);
    const appData = await db.query.applications.findFirst({
        where: {
            id: data.appId,
            ownerId: viewAllPerms.isAuthorised ? {isNotNull: true} : user.id
        },
        with: {
            database: {
                columns: {
                    id: true,
                    name: true
                }
            }
        }
    })
    if (!appData) {
        return errorToResponse(new NotFoundError("Application is not found or you do not have permission to edit it."));
    }
    const payload = {
        name: data.name.trim(),
        description: data.description.trim() || "No description provided.",
        limit: data.limit,
        alerts: data.usageAlert ? [data.usageAlert] : [],
        updatedAt: new Date(),
    }
    try {
        await db.update(applications).set(payload).where(eq(applications.id, data.appId));
    } catch (error) {
        console.error(error);
        return Response.json({ error: "INTERNAL", message: "Unexpected error occurred while updating application."}, {status: 500});
    }
    await makeAuditLog({userId: user.id, code: "APPLICATION_EDITED", data: {application: {id: data.appId, name: payload.name}, database: {id: appData.database?.id ?? "undefined", name: appData.database?.name ?? "Unknown database"}}});
    await makeAppLog({appId: data.appId, code: "APPLICATION_EDITED", data: payload, userId: user.id});
    return Response.json({ message: "Application updated successfully", id: data.appId }, { status: 200 });
})