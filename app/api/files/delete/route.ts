import { db } from "@/lib/db";
import { InvalidConfigurationError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrUser } from "@/lib/permissions/serverPermissionHelpers";
import { files as filesDb } from "@/lib/schema/schema";
import { Application } from "@/lib/schema/schemaTypes";
import { and, eq, inArray } from "drizzle-orm";
import { deleteFiles } from "@/lib/actions/files/deleteFiles";
import { makeAppLog } from "@/lib/actions/logs/appLog";
import { makeDbLog } from "@/lib/actions/logs/dbLog";
import updateFileAnalyticsEvent from "@/lib/actions/analytics/updateFileAnalyticsEvent";


export const DELETE = verifyAPIKeyOrUser(async (req, ctx, apiKey, user) => {
    try {
        const data = await req.json();
        if (!Array.isArray(data.files) || data.files.length === 0) {
            return errorToResponse(new InvalidConfigurationError());
        }
        const files = data.files as string[];
        console.log("files to delete:", files.length)
        if (files.length === 0) {
            return errorToResponse(new InvalidConfigurationError());
        }
        if (!apiKey && !data.appId && !data.databaseId) {
            return errorToResponse(new InvalidConfigurationError("Missing appId or databaseId in request body."));
        }
        if (data.databaseId && !user){
            return errorToResponse(new UnauthorisedError("You must be logged in to delete files from a database."));
        }
        let databaseKeys;
        let databaseProvider;
        let filesFromDb: {id: string, key: string, size: number, applicationId: string}[] = [];
        let databaseId: string = "";
        let appTimezone: string = "";
        let appId: string | undefined = undefined;
        if (data.appId || apiKey){
            let appData: Pick<Application, "id" | "timezone"> & { database: { provider: string, id: string, keys: any | undefined } | null } | null = null;
            if (apiKey){
                appData = await db.query.applications.findFirst({where: {id: apiKey.metadata?.appId}, with: {database: {columns: {provider: true, id: true, keys: true}}}, columns: {id: true, timezone: true}}) ?? null;
                if (!appData) {
                    return errorToResponse(new UnauthorisedError());
                }
            } else if (user){
                if (!data.appId){
                    return errorToResponse(new InvalidConfigurationError("Missing appId in request body."));
                }
                const viewAllPerms = await userHasPermissionServer({applications: ['viewAll']}, user);
                appData = await db.query.applications.findFirst({where: {id: data.appId as string, ownerId: !viewAllPerms.isAuthorised ? user.id : {isNotNull: true}}, with: {database: {columns: {provider: true, id: true, keys: true}}}, columns: {id: true, timezone: true}}) ?? null;
            }
            if (!appData) {
                return errorToResponse(new UnauthorisedError());
            }
            appId = appData.id;
            databaseKeys = appData.database?.keys;
            databaseProvider = appData.database?.provider ?? "";
            filesFromDb = await db.select({id: filesDb.id, key: filesDb.key, size: filesDb.size, applicationId: filesDb.applicationId}).from(filesDb).where(and(inArray(filesDb.id, files), eq(filesDb.applicationId, appData.id)))
            databaseId = appData.database?.id ?? "";
            appTimezone = appData.timezone;
        } else if (data.databaseId && user){
            const viewAllPerms = await userHasPermissionServer({databases: ['viewAll']}, user);
            const databaseData = await db.query.databases.findFirst({where: {id: data.databaseId as string, ownerId: !viewAllPerms.isAuthorised ? user.id : {isNotNull: true}}, columns: {provider: true, keys: true}});
            if (!databaseData) {
                return errorToResponse(new UnauthorisedError());
            }
            databaseKeys = databaseData.keys;
            databaseProvider = databaseData.provider ?? "";
            filesFromDb = await db.select({id: filesDb.id, key: filesDb.key, size: filesDb.size, applicationId: filesDb.applicationId}).from(filesDb).where(and(inArray(filesDb.id, files), eq(filesDb.databaseId, data.databaseId as string)))
            databaseId = data.databaseId;
        }
        try {
            const response = await deleteFiles({filesFromDb: filesFromDb, keys: databaseKeys, provider: databaseProvider ?? ""});
            if (appId){
                await makeAppLog({appId: appId, code: "FILE_DELETED", data: {files: response.deleted}, userId: user?.id, apiKeyId: apiKey?.id});
                await updateFileAnalyticsEvent({increment: -(filesFromDb.filter((file)=> response.deleted.includes(file.id)).reduce((acc, file) => acc + file.size, 0)), appId: appId, timezone: appTimezone});
            } else {
                const filesSortedByApp: Record<string, {id: string, key: string, size: number, applicationId: string}[]> = {};
                filesFromDb.filter((file)=> response.deleted.includes(file.id)).map((file)=>{
                    filesSortedByApp[file.applicationId] ? filesSortedByApp[file.applicationId].push(file): filesSortedByApp[file.applicationId] = [file];
                })
                await Promise.all(Object.keys(filesSortedByApp).map(async(appId)=>{
                    await makeAppLog({appId: appId, code: "FILE_DELETED", data: {files: filesSortedByApp[appId].map(file => file.id)}, userId: user?.id});
                    const appTimezone = (await db.query.applications.findFirst({where: {id: appId}, columns: {timezone: true}}))?.timezone || "";
                    await updateFileAnalyticsEvent({increment: -filesSortedByApp[appId].reduce((acc, file) => acc + file.size, 0), appId: appId, timezone: appTimezone});
                }))
            }
            await makeDbLog({dbId: databaseId, code: "FILE_DELETED", data: {files: response.deleted}, userId: user?.id, appId: appId});
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