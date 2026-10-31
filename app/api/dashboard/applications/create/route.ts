import { makeAuditLog } from "@/lib/actions/logs/makeAuditLog";
import sendNotification from "@/lib/actions/notifications/sendNotification";
import { db } from "@/lib/db";
import { InvalidConfigurationError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyUserWithPermission } from "@/lib/permissions/serverPermissionHelpers";
import { applications, databases } from "@/lib/schema/schema";
import { generateId } from "better-auth";
import { eq } from "drizzle-orm";

export const POST = verifyUserWithPermission(async(user)=>{
    return (await userHasPermissionServer({applications: ['create']}, user)).isAuthorised || (await userHasPermissionServer({applications: ['request']}, user)).isAuthorised;
}, async(req: Request, ctx, user) => {
    console.log("Posted")
    const data = await req.json();
    console.log("Data received:", data);
    const requiredKeys = ["name", "description", "databaseId"]
    if (requiredKeys.filter(key => !Object.keys(data).includes(key)).length > 0) {
        console.log("Missing required keys. Expected:", requiredKeys, "Got:", Object.keys(data));
        return Response.json({ error: "INVALID_CONFIGURATION", message: "Configuration does not match expectations." }, { status: 400 });
    }
    const dbData = (await db.select().from(databases).where(eq(databases.id, data.databaseId)).limit(1))[0]
    if (!dbData) {
        return errorToResponse(new InvalidConfigurationError("Database not found"));
    }
    const createPerms = await userHasPermissionServer({applications: ['create']}, user);
    const payload: typeof applications.$inferInsert = {
        id: generateId(16),
        ownerId: user.id,
        name: data.name,
        description: data.description,
        databaseId: data.databaseId,
        limit: data.limit || 0,
        alerts: data.usageAlert ? [data.usageAlert] : [],
        status: createPerms.isAuthorised ? "active" : "requested",
    }
    try {
        await db.insert(applications).values(payload);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "INTERNAL", message: "Unexpected error occurred while creating application."}, {status: 500});
    }
    await makeAuditLog({userId: user.id, code: "APPLICATION_CREATED", data: {application: {id: payload.id, name: payload.name}, database: {id: dbData.id, name: dbData.name}}});
    await sendNotification("APPLICATION_CREATED", {userGroup: "admins", appName: payload.name, databaseName: dbData.name, triggerUser: {id: user.id, name: user.name}, link: `/dashboard/applications/${payload.id}`});
    return Response.json({ message: "Application created successfully", id: payload.id }, { status: 200 });
})