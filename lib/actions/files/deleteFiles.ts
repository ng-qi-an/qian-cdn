import { db } from "@/lib/db";
import { InvalidConfigurationError, UnauthorisedError } from "@/lib/errors";
import { HCDNClient } from "@/lib/providers/hcdn/client";
import { HCDNAuthenticationError } from "@/lib/providers/hcdn/errors";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { files as filesDb } from "@/lib/schema/schema";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { and, eq, inArray } from "drizzle-orm";

export async function deleteFiles({filesFromDb, keys, provider}: {filesFromDb: {id: string, key: string}[], keys: any, provider: string}){
    if (filesFromDb.length === 0){
        throw new InvalidConfigurationError("No files were found in the database for the provided file IDs.");
    }
    if (provider == "hackclub-cdn"){
        const client = new HCDNClient(keys.apiKey);
        try {
            const {deleted, failed} = await client.deleteFiles(filesFromDb.map(f => f.key));
            if (deleted.length == 0){
                throw new InvalidConfigurationError("No files were deleted. Check that the files exist in the provider.");
            }
            await db.delete(filesDb).where(inArray(filesDb.key, deleted.map(d => d.id)));
            const deletedFiles = filesFromDb.filter(f => deleted.find(d => d.id == f.key)).map(f => f.id);
            const failedFiles = filesFromDb.filter(f => failed.includes(f.key)).map(f => f.id);
            return {deleted: deletedFiles, failed: failedFiles};
        } catch (error) {
            if (error instanceof HCDNAuthenticationError){
                throw new UnauthorisedError("Could not connect to database provider. Please check your database key configurations.");
            } else {
                console.error("Error deleting files to HCDN:", error);
                throw error;
            }
        }
    } else if (provider == "cloudflare-r2" || provider == "amazon-s3") {
        const client = getS3Client(keys.accessUrl, keys.accessKeyId, keys.secretAccessKey);
        try {
            const response = await client.send(new DeleteObjectsCommand({
                Bucket: keys.bucketName,
                Delete: {
                    Objects: filesFromDb.map((file)=> ({Key: file.key})),
                }
            }));
            if (!response.Deleted || response.Deleted.length == 0){
                throw new InvalidConfigurationError("No files were deleted. Check that the files exist in the provider.");
            }
            const deletedFiles = filesFromDb.filter(f => response.Deleted!.find(d => d.Key == f.key)).map(f => f.id);
            await db.delete(filesDb).where(inArray(filesDb.id, deletedFiles));
            const failedFiles = filesFromDb.filter(f => !response.Deleted!.find(d => d.Key == f.key)).map(f => f.id);
            return {deleted: deletedFiles, failed: failedFiles};
        } catch (error) {
            console.log("Error deleting file to S3:", error);
            if (isCredentialError(error)){
                throw new UnauthorisedError("Could not connect to database provider. Please check your database key configurations.");
            } else {
                console.error("Error deleting files on S3:", error);
                throw error;
            }
        }
    } else {
        console.log(provider)
        throw new InvalidConfigurationError("The api key's database provider is not supported for file uploads.");
    }
}