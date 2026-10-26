import { makeDbLog } from "@/lib/actions/logs/dbLog";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyUser } from "@/lib/permissions/serverPermissionHelpers";
import { HCDNAuthenticationError } from "@/lib/providers/hcdn/errors";
import { getHCDNClient } from "@/lib/providers/hcdn/getClient";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { databases } from "@/lib/schema/schema";
import { AccessDenied, CreateBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { and, eq, isNotNull } from "drizzle-orm";

export const PATCH = verifyUser(async(req: Request, ctx, user) => {
    const data = await req.json();
    const requiredKeys = ["name", "dbId", "visibility", "keys", "limit", "usageAlert"]
    if (requiredKeys.filter(key => !Object.keys(data).includes(key)).length > 0) {
        console.log("Missing required keys. Expected:", requiredKeys, "Got:", Object.keys(data));
        return errorToResponse(new InvalidConfigurationError("Some required fields are missing or invalid."));
    }
    const viewAllPerms = await userHasPermissionServer({databases: ['viewAll']}, user);
    const dbData = (await db.select().from(databases).where(and(eq(databases.id, data.dbId), viewAllPerms.isAuthorised ? isNotNull(databases.id) : eq(databases.ownerId, user.id))))[0];
    if (!dbData) {
        return errorToResponse(new NotFoundError("Database is not found or you do not have permission to edit it."));
    }
    if (dbData.provider == "cloudflare-r2" || dbData.provider == "amazon-s3") {
        if (!data.keys.accessUrl || !data.keys.accessKeyId || !data.keys.secretAccessKey || !data.keys.bucketName) {
            return errorToResponse(new InvalidConfigurationError("Access URL, access key ID, secret access key and bucketName are required"));
        }
        const client = getS3Client(data.keys.accessUrl, data.keys.accessKeyId, data.keys.secretAccessKey);
        try {
            const r = await client.send(new ListBucketsCommand())
            if (!r.Buckets) {
                return errorToResponse(new InvalidConfigurationError("Check that your access URL, access key ID, and secret access key are valid. Make sure your key has access to list all buckets."));
            }
            if (!r.Buckets.find(b => b.Name == data.keys.bucketName)) {
                try {
                    const createR = await client.send(new CreateBucketCommand({ Bucket: data.keys.bucketName }));
                    console.log("Create bucket response:", createR);
                    if (createR.$metadata.httpStatusCode != 200){
                        return errorToResponse(new Error("Something went wrong creating your bucket. Create a bucket manually instead."));
                    }
                    // Successfully made bucket, so continue to the end of the big if
                } catch (error) {
                    if (error instanceof AccessDenied){
                        return errorToResponse(new InvalidConfigurationError("This key has no permission to create buckets. Update the key's permissions, or create the bucket on your own."));
                    }
                    if (error instanceof Error && (error.name == "InvalidBucketName")) {
                        return errorToResponse(new InvalidConfigurationError("The bucket name you provided is invalid. Bucket names must be between 3 and 63 characters long, and can only contain lowercase letters, numbers, and hyphens."));
                    }
                    console.error(error);
                    return errorToResponse(error)
                }
            }
            // Bucket found already, so continue to the end of the big if
        } catch (error) {
            if (isCredentialError(error) || error instanceof Error && (error.message.includes("ENOTFOUND") || error.name == "InvalidArgument")) {
                return errorToResponse(new InvalidConfigurationError("Check that your access URL, access key ID, and secret access key are valid. Make sure your key has access to list all buckets."));
            } else {
                console.error(error);
                return errorToResponse(error);
            }
        }
    } else if (dbData.provider == "hackclub-cdn"){
        if (!data.keys.apiKey) {
            return errorToResponse(new InvalidConfigurationError("API key is required for Hack Club CDN."));
        }
        const client = getHCDNClient(data.keys.apiKey);
        try {
            await client.testConnection();
            // Connection successful, so continue to the end of the big if
        } catch (error) {
            if (error instanceof HCDNAuthenticationError) {
                return errorToResponse(new InvalidConfigurationError("Check that your API key is valid."));
            } else {
                console.error(error);
                return errorToResponse(error);
            }
        }
    } else {
        return errorToResponse(new InvalidConfigurationError("This provider isn't supported."));
    }
    const payload = {
        name: data.name.trim(),
        visibility: data.visibility,
        keys: data.keys,
        limit: data.limit,
        alerts: data.usageAlert ? [data.usageAlert] : [],
        updatedAt: new Date(),
    }
    try {
        await db.update(databases).set(payload).where(eq(databases.id, data.dbId));
    } catch (error) {
        console.error(error);
        return errorToResponse(error);
    }
    await makeDbLog({dbId: data.dbId, code: "DATABASE_EDITED", data: payload, userId: user.id});
    return Response.json({ message: "Database updated successfully", id: data.appId }, { status: 200 });
})