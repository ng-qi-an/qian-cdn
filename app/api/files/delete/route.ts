import { db } from "@/lib/db";
import { InvalidConfigurationError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrUser } from "@/lib/permissionHelpers";
import { HCDNClient } from "@/lib/providers/hcdn/client";
import { HCDNAuthenticationError } from "@/lib/providers/hcdn/errors";
import { files as filesDb } from "@/lib/schema/schema";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { Application } from "@/lib/schema/schemaTypes";
import { and, eq, inArray } from "drizzle-orm";
import { deleteFiles } from "@/lib/actions/files/deleteFiles";
import { makeAppLog } from "@/lib/actions/logs/appLog";


export const DELETE = verifyAPIKeyOrUser(async (req, ctx, apiKey, user) => {
    try {
        const data = await req.json();
        const files = data.files as string[];
        console.log("files to delete:", files.length)
        if (files.length === 0) {
            return errorToResponse(new InvalidConfigurationError());
        }
        let appData: Pick<Application, "id"> & { database: { provider: string, id: string, keys: any | undefined } | null } | null = null;
        if (apiKey){
            appData = await db.query.applications.findFirst({where: {id: apiKey.metadata?.appId}, with: {database: {columns: {provider: true, id: true, keys: true}}}, columns: {id: true}}) ?? null;
        } else if (user){
            if (!data.appId){
                return errorToResponse(new InvalidConfigurationError("Missing appId in request body."));
            }
            const viewAllPerms = await userHasPermissionServer({applications: ['viewAll']}, user);
            appData = await db.query.applications.findFirst({where: {id: data.appId as string, ownerId: !viewAllPerms.isAuthorised ? user.id : {isNotNull: true}}, with: {database: {columns: {provider: true, id: true, keys: true}}}, columns: {id: true}}) ?? null;
        }
        if (!appData) {
            return errorToResponse(new UnauthorisedError());
        }
        try {
            const response = await deleteFiles({filesFromDb: await db.select({id: filesDb.id, key: filesDb.key}).from(filesDb).where(and(inArray(filesDb.id, files), eq(filesDb.applicationId, appData.id))), keys: appData.database?.keys, provider: appData.database?.provider ?? ""});
            await makeAppLog({appId: appData.id, code: "FILE_DELETED", data: {files: response.deleted}, userId: user?.id, apiKeyId: apiKey?.id});
            return Response.json(response, {status: 200});
        } catch (error) {
            console.error("Error deleting files:", error);
            return errorToResponse(error);
        }
    } catch (error) {
        console.error("Error processing file upload:", error);
        return errorToResponse(error);
    }
})