'use client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Database } from "@/lib/schema/schemaTypes";
import { ExternalLink, OctagonAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProviderSelector from "./ProviderSelector";
import { availableServices } from "@/lib/services";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { convertUnit, Unit } from "@/lib/unitConverter";

export function CreateDatabasesForm({fetchedDatabases, createPerms}: {fetchedDatabases: Partial<Database>[], createPerms: any}){
    const router = useRouter();
    const [name, setName] = useState("");
    const [limit, setLimit] = useState("20");
    const [limitUnit, setLimitUnit] = useState<Unit>("gb");
    const [usageAlert, setUsageAlert] = useState("80");
    const [visibility, setVisibility] = useState("private");
    const [provider, setProvider] = useState("cloudflare-r2");
    // This for HC CDN
    const [apiKey, setApiKey] = useState("");
    // This for R2 / S3.
    const [accessKeyId, setAccessKeyId] = useState("");
    const [secretAccessKey, setSecretAccessKey] = useState("");
    const [accessUrl, setAccessUrl] = useState("");
    const [bucketName, setBucketName] = useState("");
    const s3BucketNameRegex = /^(?!\d{1,3}(?:\.\d{1,3}){3}$)(?!.*\.\.)(?!.*\.-)(?!.*-\. )[a-z0-9](?:[a-z0-9.-]{1,61}[a-z0-9])$/
    const isS3BucketNameValid = s3BucketNameRegex.test(bucketName) && bucketName.length >= 3 && bucketName.length <= 63;
    // submiting states
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [submissionError, setSubmissionError] = useState({title: "", message: ""});
    return <div className="grid grid-cols-1 flex-1 min-h-0 w-full pt-4 gap-2">
        {submissionError.title && <Alert variant="destructive" className="">
            <OctagonAlert/>
            <AlertTitle>{submissionError.title}</AlertTitle>
            <AlertDescription>{submissionError.message}</AlertDescription>
        </Alert>}
        <form className="w-full h-full flex flex-col min-h-0" onSubmit={async(e)=>{
            e.preventDefault()
            if (!name  || name.trim() == "" || !limit || !limitUnit || !usageAlert || !visibility || !provider || (provider == "cloudflare-r2" && (!accessUrl || !accessKeyId || !secretAccessKey || !bucketName || !isS3BucketNameValid)) || (provider == "hackclub-cdn" && !apiKey)){
                setSubmissionError({title: "Required fields missing or invalid", message: "Please fill in all required fields and ensure there are no warnings before submitting."});
                return;
            }
            if (fetchedDatabases.find(db => db.name == name)){
                return;
            }
            setIsSubmitting(true);
            setSubmissionError({title: "", message: ""});
            const response = await fetch("/api/dashboard/databases/create", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: provider,
                    keys: provider == "cloudflare-r2" ? {
                        accessUrl: accessUrl,
                        accessKeyId: accessKeyId,
                        secretAccessKey: secretAccessKey,
                        bucketName: bucketName
                    } : provider == "hackclub-cdn" ? {
                        apiKey: apiKey
                    } : {},
                    name: name.trim(),
                    limit: convertUnit(Number(limit), limitUnit, "b"),
                    usageAlert: Number(usageAlert),
                    visibility,
                })
            });
            const responseData = await response.json();
            if (!response.ok){
                setIsSubmitting(false);
                console.log(responseData);
                return setSubmissionError({title: responseData.error, message: responseData.message || "An unknown error occurred while testing the database connection."});
            }
            setIsSubmitting(false);
            toast.add({
                title: "Database created",
                description: "Your database has been created successfully.",
                type: "success",
            });
            router.push("/dashboard/admin/databases/"+responseData.id);
        }}>
            <div className="w-full h-full overflow-auto xl:grid xl:grid-cols-2 gap-1 space-y-2 xl:space-y-0 p-1">
                <Card className="w-full h-max xl:h-full">
                    <CardHeader>
                        <CardTitle>General</CardTitle>
                        <CardDescription>Information about your new database</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input type="text" value={name} onChange={(e)=> setName(e.target.value)} required placeholder="John Doe's R2"/>
                                {fetchedDatabases.find((x)=> x.name == name.trim()) ? <FieldError>A database with this name already exists.</FieldError>: <FieldDescription>The name of your database. Must be unique.</FieldDescription>}
                            </Field>
                            <Field>
                                <FieldLabel>Visibility</FieldLabel>
                                <Select items={[{label: "Public", value: "public"}, {label: "Private", value: "private"}]} onValueChange={(value)=> setVisibility(value!)} value={visibility} required>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldDescription>{visibility == "public" ? "All users can view and use this database. Only you can edit it." : "Only you and admins can use and edit this database."} </FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel>Global limits</FieldLabel>
                                <div className="flex items-center">
                                    <Slider max={100} step={0.5} value={Number(limit)} onValueChange={(value)=> setLimit(value.toString())} />
                                    <Input value={limit} onChange={(e)=> setLimit(Number(e.target.value) >= 0 ? e.target.value.replace(/^0+(?=\d)/, "") : 0 || "0")} className="w-14 text-center mx-2"/>
                                    <Select items={[{label: "GB", value: "gb"}, {label: "MB", value: "mb"}, {label: "KB", value: "kb"}]} onValueChange={(value)=> setLimitUnit(value!)} value={limitUnit}>
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gb">GB</SelectItem>
                                            <SelectItem value="mb">MB</SelectItem>
                                            <SelectItem value="kb">KB</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <FieldDescription>{Number(limit) == 0 ? "The database will not have a size limit." : `The database will stop accepting files when it exceeds ${limit} ${limitUnit.toUpperCase()}.`}</FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel>Limit alert</FieldLabel>
                                <div className="flex items-center">
                                    <Slider max={100} step={1} value={Number(usageAlert)} onValueChange={(value)=> setUsageAlert(value.toString())} />
                                    <Input value={usageAlert} onChange={(e)=> setUsageAlert(Math.max(0, Math.min(Number(e.target.value) || 0, 100)).toString() || "0")} className="w-14 text-center mx-2"/>
                                    %
                                </div>
                                <FieldDescription>{Number(limit) * Number(usageAlert) == 0 ? "You will not receive any alerts." : `You will recieve alerts when the database exceeds ${((Number(usageAlert) / 100) * Number(limit)).toFixed(2)} ${limitUnit.toUpperCase()}.`}</FieldDescription>
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
                <div className="w-full h-max xl:h-full xl:overflow-auto xl:border dark:xl:border-none">
                    <Card className="w-full h-max xl:h-full xl:overflow-auto">
                        <CardHeader>
                            <CardTitle>Service</CardTitle>
                            <CardDescription>Connect your database to a file storage service</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Provider</FieldLabel>
                                    <FieldDescription>Choose wisely. This cannot be changed later.</FieldDescription>
                                    <ProviderSelector value={provider} onChange={(value) => setProvider(value)} />
                                    <FieldDescription className="flex gap-1">Need help setting up? <a href={availableServices.find((s) => s.id === provider)?.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">Open the docs <ExternalLink className="size-4"/></a></FieldDescription>
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
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <Link href="/dashboard/admin/databases" className="w-full hidden md:block">
                    <Button disabled={isSubmitting} className="w-full" type="button" variant="secondary">
                        Cancel
                    </Button>
                </Link>
                <Button disabled={isSubmitting} className="w-full" type="submit">
                    Create Database {isSubmitting && <Spinner/>}
                </Button>
            </div>
        </form>
    </div>
}