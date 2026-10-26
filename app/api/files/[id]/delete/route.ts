import updateFilesAnalyticsEvent from "@/lib/actions/analytics/updateFilesAnalyticsEvent";
import updateRequestsAnalyticsEvent from "@/lib/actions/analytics/updateRequestsAnalyticsEvent";
import updateSizeAnalyticsEvent from "@/lib/actions/analytics/updateSizeAnalyticsEvent";
import { makeAppLog } from "@/lib/actions/logs/appLog";
import { makeDbLog } from "@/lib/actions/logs/dbLog";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrUser } from "@/lib/permissions/serverPermissionHelpers";
import { HCDNClient } from "@/lib/providers/hcdn/client";
import { HCDNAuthenticationError } from "@/lib/providers/hcdn/errors";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { files } from "@/lib/schema/schema";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";

export const DELETE = verifyAPIKeyOrUser(async (req, ctx: { params: Promise<{ id: string }> }, apiKey, user) => {
    if (!process.env.NEXT_PUBLIC_TIMEZONE){
        return errorToResponse(new InvalidConfigurationError("The NEXT_PUBLIC_TIMEZONE environment variable is not set."));
    }
    try {
        const { id } = await ctx.params;
        if (!id){
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
            const viewAllDbPerms = await userHasPermissionServer({databases: ['viewAll']}, user);
            if (!(viewAllPerms.isAuthorised || viewAllDbPerms.isAuthorised) && user.id != file.applications?.ownerId){
                return errorToResponse(new UnauthorisedError());
            }
        }
        if (file.database?.provider == "hackclub-cdn"){
            const client = new HCDNClient(file.database.keys.apiKey);
            try {
                await client.deleteFile(file.key);
            } catch (error) {
                if (error instanceof HCDNAuthenticationError){
                    console.log("HCDN authentication error while deleting file. Api key", file.database.keys.apiKey);
                    return errorToResponse(new UnauthorisedError("Could not connect to database provider. Please check your database key configurations."));
                }
                console.error("Error deleting file on HCDN:", error);
                return errorToResponse(error);
            }
        } else if (file.database?.provider == "cloudflare-r2" || file.database?.provider == "amazon-s3") {
            const client = getS3Client(file.database.keys.accessUrl, file.database.keys.accessKeyId, file.database.keys.secretAccessKey);
            try {
                const response = await client.send(new DeleteObjectCommand({
                    Bucket: file.database.keys.bucketName,
                    Key: file.key
                }));
            } catch (error) {
                if (isCredentialError(error)){
                    return errorToResponse(new UnauthorisedError("Could not connect to database provider. Please check your database key configurations."));
                }
                console.error("Error deleting file on S3:", error);
                return errorToResponse(error);
            }
        } else {
            return errorToResponse(new InvalidConfigurationError("The api key's database provider is not supported for file uploads."));
        }
        const response = await db.delete(files).where(eq(files.id, id));
        if (response.rowCount === 0){
            return errorToResponse(new NotFoundError("File not found."));
        }
        await makeAppLog({appId: file.applicationId, code: "FILE_DELETED", data: {files: [file.id]}, userId: user?.id, apiKeyId: apiKey?.id});
        await makeDbLog({dbId: file.databaseId, code: "FILE_DELETED", data: {files: [file.id]}, userId: user?.id, appId: file.applicationId});
        await updateRequestsAnalyticsEvent({increment: 1, appId: file.applicationId, timezone: process.env.NEXT_PUBLIC_TIMEZONE});
        await updateFilesAnalyticsEvent({increment: -1, appId: file.applicationId, timezone: process.env.NEXT_PUBLIC_TIMEZONE});
        await updateSizeAnalyticsEvent({increment: -file.size, appId: file.applicationId, timezone: process.env.NEXT_PUBLIC_TIMEZONE});
        return Response.json({ message: "File deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting file:", error);
        return errorToResponse(error);
    }
})