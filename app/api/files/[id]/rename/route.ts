import { makeAppLog } from "@/lib/actions/logs/appLog";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrUser } from "@/lib/permissionHelpers";
import { HCDNClient } from "@/lib/providers/hcdn/client";
import { HCDNAuthenticationError } from "@/lib/providers/hcdn/errors";
import { files } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";

export const PATCH = verifyAPIKeyOrUser(async (req, ctx: { params: Promise<{ id: string }> }, apiKey, user) => {
    try {
        const data = await req.json();
        const { id } = await ctx.params;
        if (!data || !data.name || !id){
            return errorToResponse(new InvalidConfigurationError());
        }
        const file = await db.query.files.findFirst({where: {id}, with: {database: {columns: {provider: true, keys: true}}, applications: {columns: {ownerId: true}}}});
        if (!file){
            return errorToResponse(new NotFoundError("File not found."));
        }
        if (apiKey && apiKey.metadata?.appId != file.applicationId){
            return errorToResponse(new UnauthorisedError());
        } else if (user){
            const viewAllPerms = await userHasPermissionServer({applications: ['viewAll']}, user);
            if (!viewAllPerms.isAuthorised && user.id != file.applications?.ownerId){
                return errorToResponse(new UnauthorisedError());
            }
        }
        if (file.database?.provider == "hackclub-cdn"){
            const client = new HCDNClient(file.database.keys.apiKey);
            try {
                await client.renameFile(file.key, data.name);
            } catch (error) {
                if (error instanceof HCDNAuthenticationError){
                    console.log("HCDN authentication error while renaming file. Api key", file.database.keys.apiKey);
                    return errorToResponse(new UnauthorisedError("Could not connect to database provider. Please check your database key configurations."));
                }
                console.error("Error renaming file on HCDN:", error);
                return errorToResponse(error);
            }
        }
        await db.update(files).set({name: data.name}).where(eq(files.id, id));
        await makeAppLog({appId: file.applicationId, code: "FILE_EDITED", data: {oldName: file.name, newName: data.name}, userId: user?.id, apiKeyId: apiKey?.id});
        return Response.json({ message: "File renamed successfully", newName: data.name }, { status: 200 });
    } catch (error) {
        console.error("Error renaming file:", error);
        return errorToResponse(error);
    }
})