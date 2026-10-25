'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import ProviderSelector from "../../create/ProviderSelector";


export default function ServiceSettingsCard({provider, keys, setKeys}: {provider: string, keys: Record<string, string>, setKeys: (keys: Record<string, string>) => void}){
    const [accessUrl, setAccessUrl] = useState(keys.accessUrl);
    const [accessKeyId, setAccessKeyId] = useState(keys.accessKeyId);
    const [secretAccessKey, setSecretAccessKey] = useState(keys.secretAccessKey);
    const [bucketName, setBucketName] = useState(keys.bucketName);
    const [apiKey, setApiKey] = useState(keys.apiKey);
    
    useEffect(()=>{
        setKeys({accessUrl, accessKeyId, secretAccessKey, bucketName, apiKey})
    }, [accessUrl, accessKeyId, secretAccessKey, bucketName, apiKey])

    const s3BucketNameRegex = /^(?!\d{1,3}(?:\.\d{1,3}){3}$)(?!.*\.\.)(?!.*\.-)(?!.*-\. )[a-z0-9](?:[a-z0-9.-]{1,61}[a-z0-9])$/
    const isS3BucketNameValid = bucketName && s3BucketNameRegex.test(bucketName) && bucketName.length >= 3 && bucketName.length <= 63;
    return <Card className="w-full shrink-0">
        <CardHeader>
            <CardTitle>Service</CardTitle>
            <CardDescription>Connect your database to a file storage service</CardDescription>
        </CardHeader>
        <CardContent>
            <FieldGroup>
                <Field>
                    <FieldLabel>Provider</FieldLabel>
                    <FieldDescription>This is for reference only and cannot be changed.</FieldDescription>
                    <ProviderSelector disabled value={provider} onChange={(value) => {}} />
                </Field>

                {provider == "cloudflare-r2" ? <>
                    <Field>
                        <FieldLabel>Access URL</FieldLabel>
                        <Input type="url" value={accessUrl} onChange={(e)=> setAccessUrl(e.target.value)} placeholder={"https://[...].r2.cloudflarestorage.com"} required />
                        <FieldDescription>This should be a link, not an API key. You should use the S3 configuration.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel>Access Key ID</FieldLabel>
                        <Input type="text" value={accessKeyId} onChange={(e)=> setAccessKeyId(e.target.value)} required/>
                        <FieldDescription>This is typically shorter than your secret key.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel>Secret Access Key</FieldLabel>
                        <Input type="text" value={secretAccessKey} onChange={(e)=> setSecretAccessKey(e.target.value)} required/>
                        <FieldDescription>This is typically longer than the Access Key ID.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel>Bucket Name</FieldLabel>
                        <Input type="text" value={bucketName} onChange={(e)=> setBucketName(e.target.value)} required/>
                        {!bucketName || isS3BucketNameValid ?
                            <FieldDescription>The bucket you want to use. We'll create one if it doesn't exist.</FieldDescription>
                        : <FieldError>Bucket names must be between 3 and 63 characters long, and can only contain lowercase letters, numbers, and hyphens.</FieldError>}
                    </Field>
                </> : provider == "hackclub-cdn" && <>
                    <Field>
                        <FieldLabel>API Key</FieldLabel>
                        <Input type="text" value={apiKey} onChange={(e)=> setApiKey(e.target.value)} required/>
                        <FieldDescription>This is the API key you generated in your Hack Club CDN account.</FieldDescription>
                    </Field>
                </>
                }
            </FieldGroup>
        </CardContent>
    </Card>
}