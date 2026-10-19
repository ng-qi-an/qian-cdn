import { makeAppLog } from "@/lib/actions/logs/appLog";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyUser } from "@/lib/permissionHelpers";
import { apikey } from "@/lib/schema/auth-schema";
import { and, eq } from "drizzle-orm";

export const DELETE = verifyUser(async(req, ctx, user) => {
    const { keyId } = await req.json();
    if (!keyId){
        return errorToResponse(new InvalidConfigurationError())
    }
    const viewAllPerms = await userHasPermissionServer({applications: ["viewAll"]}, user);
    const keyData = (await db.select().from(apikey).where(and(eq(apikey.id, keyId), viewAllPerms.isAuthorised ? undefined : eq(apikey.referenceId, viewAllPerms.user.id))))[0];
    if (!keyData || !keyData.metadata){
        return errorToResponse(new NotFoundError("The API key you are trying to delete does not exist or you do not have access to it."))
    }
    const appId = JSON.parse(keyData.metadata!).appId;
    if (!appId){
        return errorToResponse(new NotFoundError("The API key you are trying to delete does not have an associated application."))
    }
    await db.delete(apikey).where(eq(apikey.id, keyId));
    await makeAppLog({appId: appId, code: "APIKEY_DELETED", userId: user.id, data: {apiKeyId: keyData.id, apiKeyName: keyData.name}})
    return Response.json({ message: "API key deleted successfully" }, { status: 200 });
})