import { db } from "@/lib/db";
import { userHasPermissionServer, verifyUserWithPermission } from "@/lib/permissions/serverPermissionHelpers";
import { HCDNAuthenticationError } from "@/lib/providers/hcdn/errors";
import { getHCDNClient } from "@/lib/providers/hcdn/getClient";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { databases } from "@/lib/schema/schema";
import { AccessDenied, CreateBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { generateId } from "better-auth";

export const POST = verifyUserWithPermission(async(user)=>{
    return (await userHasPermissionServer({databases: ['create']}, user)).isAuthorised;
}, async(req: Request, ctx, user) => {
    const data = await req.json();
    const requiredKeys = ["provider", "keys", "name", "limit", "usageAlert", "visibility"]
    if (requiredKeys.filter(key => !Object.keys(data).includes(key)).length > 0) {
        console.log("Missing required keys. Expected:", requiredKeys, "Got:", Object.keys(data));
        return Response.json({ error: "INVALID_CONFIGURATION", message: "Configuration does not match expectations." }, { status: 400 });
    }
    const provider = data.provider;
    const keys = data.keys;
    if (provider == "cloudflare-r2" || provider == "amazon-s3") {
        if (!keys.accessUrl || !keys.accessKeyId || !keys.secretAccessKey || !keys.bucketName) {
            return Response.json({ error: "INVALID_CONFIGURATION", message: "Access URL, access key ID, secret access key and bucketName are required" }, { status: 400 });
        }
        const client = getS3Client(keys.accessUrl, keys.accessKeyId, keys.secretAccessKey);
        try {
            const r = await client.send(new ListBucketsCommand())
            if (!r.Buckets) {
                return Response.json({ error: "INVALID_CONFIGURATION", message: "Check that your access URL, access key ID, and secret access key are valid. Make sure your key has access to list all buckets." }, { status: 401 });
            }
            if (!r.Buckets.find(b => b.Name == keys.bucketName)) {
                try {
                    const createR = await client.send(new CreateBucketCommand({ Bucket: keys.bucketName }));
                    console.log("Create bucket response:", createR);
                    if (createR.$metadata.httpStatusCode != 200){
                        return Response.json({ error: "INTERNAL", message: "Something went wrong creating your bucket. Create a bucket manually instead." }, { status: 500 });
                    }
                    // Successfully made bucket, so continue to the end of the big if
                } catch (error) {
                    if (error instanceof AccessDenied){
                        return Response.json({ error: "INVALID_CONFIGURATION", message: "This key has no permission to create buckets. Update the key's permissions, or create the bucket on your own." }, { status: 401 });
                    }
                    if (error instanceof Error && (error.name == "InvalidBucketName")) {
                        return Response.json({ error: "INVALID_CONFIGURATION", message: "The bucket name you provided is invalid. Bucket names must be between 3 and 63 characters long, and can only contain lowercase letters, numbers, and hyphens." }, { status: 400 });
                    }
                    console.error(error);
                    return Response.json({ error: "INTERNAL", message: "Unexpected error occurred while creating bucket."}, {status: 500});
                }
            }
            // Bucket found already, so continue to the end of the big if
        } catch (error) {
            if (error instanceof AccessDenied || error instanceof Error && (error.message.includes("ENOTFOUND") || error.name == "InvalidArgument" || error.name == "SignatureDoesNotMatch")) {
                return Response.json({ error: "INVALID_CONFIGURATION", message: "Check that your access URL, access key ID, and secret access key are valid. Make sure your key has access to list all buckets." }, { status: 401 });
            } else {
                console.error(error);
                if (error instanceof Error) {
                    console.log("Name:", error.name, "Message:", error.message);
                }
                return Response.json({ error: "INTERNAL", message: "Unexpected error occurred while testing connection."}, {status: 500});
            }
        }
    } else if (provider == "hackclub-cdn"){
        if (!keys.apiKey) {
            return Response.json({ error: "INVALID_CONFIGURATION", message: "API key is required" }, { status: 400 });
        }
        const client = getHCDNClient(keys.apiKey);
        try {
            await client.testConnection();
            // Connection successful, so continue to the end of the big if
        } catch (error) {
            if (error instanceof HCDNAuthenticationError) {
                return Response.json({ error: "INVALID_CONFIGURATION", message: "Check that your API key is valid." }, { status: 401 });
            } else {
                console.error(error);
                return Response.json({ error: "INTERNAL", message: "Unexpected error occurred while testing connection."}, {status: 500});
            }
        }
    } else {
        return Response.json({ error: "UNSUPPORTED_PROVIDER", message: "This provider isn't supported." }, { status: 400 });
    }
    const payload: typeof databases.$inferInsert = {
        id: generateId(16),
        ownerId: user.id,
        name: data.name,
        provider: data.provider,
        keys: data.keys,
        limit: data.limit,
        alerts: data.usageAlert ? [data.usageAlert] : [],
        visibility: data.visibility,
    }
    try {
        await db.insert(databases).values(payload);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "INTERNAL", message: "Unexpected error occurred while creating database."}, {status: 500});
    }
    return Response.json({ message: "Database created successfully", id: payload.id }, { status: 200 });
})