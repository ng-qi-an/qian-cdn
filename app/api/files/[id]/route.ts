import updateRequestsAnalyticsEvent from "@/lib/actions/analytics/updateRequestsAnalyticsEvent";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError } from "@/lib/errors";
import { errorToResponse } from "@/lib/permissions/serverPermissionHelpers";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
    if (!process.env.NEXT_PUBLIC_TIMEZONE){
        return errorToResponse(new InvalidConfigurationError("The NEXT_PUBLIC_TIMEZONE environment variable is not set."));
    }
    const {id} = await params;
    const fileData = await db.query.files.findFirst({where: {id}, with: {database: {columns: {provider: true, keys: true}}}});
    if (!fileData){
        return errorToResponse(new NotFoundError());
    }
    if (fileData.database?.provider == "hackclub-cdn"){
        const response = await fetch(`https://cdn.hackclub.com/${fileData.key}/${fileData.name}`);
        const headers = new Headers(response.headers);
        await updateRequestsAnalyticsEvent({increment: 1, appId: fileData.applicationId, timezone: process.env.NEXT_PUBLIC_TIMEZONE});
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
        });
    } else if (fileData.database?.provider == "cloudflare-r2" || fileData.database?.provider == "amazon-s3") {
        const client = getS3Client(fileData.database.keys.accessUrl, fileData.database.keys.accessKeyId, fileData.database.keys.secretAccessKey);
        try {
            const response = await client.send(new GetObjectCommand({
                Bucket: fileData.database.keys.bucketName,
                Key: fileData.key,
            }));
            if (!response.Body) {
                return errorToResponse(new NotFoundError("The file has no content."));
            }

            const headers = new Headers();
            headers.set("Content-Type", response.ContentType || "application/octet-stream");
            if (response.ContentLength !== undefined) headers.set("Content-Length", response.ContentLength.toString());
            await updateRequestsAnalyticsEvent({increment: 1, appId: fileData.applicationId, timezone: process.env.NEXT_PUBLIC_TIMEZONE});
            return new Response(response.Body.transformToWebStream(), {
                headers,
            });
        } catch (error) {
            if (isCredentialError(error)){
                return errorToResponse(new InvalidConfigurationError("Could not connect to database provider. Please check your database key configurations."));
            }
            console.error("Error downloading file from S3:", error);
            return errorToResponse(error);
        }
    }
    return errorToResponse(new InvalidConfigurationError("The configured database provider is not supported."));
};