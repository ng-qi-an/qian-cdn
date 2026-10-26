'use client';
import DotField from "@/components/DotField";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import UsageBar from "@/components/UsageBar";
import { Database } from "@/lib/schema/schemaTypes";
import { availableServices } from "@/lib/services";
import { AppWindowMac, ArrowDown, ArrowRight, Cloud, DatabaseIcon, Eye, LaptopMinimal, Lock, OctagonAlert, User } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateApplicationsForm({dbCreatePerms, fetchedDatabases, fetchedApps, createPerms, requestPerms}: {dbCreatePerms?: any, fetchedDatabases: Partial<Database & {owner: {name: string} | null, files: {size: number}[] | null}>[], fetchedApps: {name: string}[], createPerms: any, requestPerms: any}){
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [databaseId, setDatabaseId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState({title: "", message: ""});
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const personalDbs = fetchedDatabases.filter((db) => db.ownerId == createPerms.user.id);
    const publicDbs = fetchedDatabases.filter((db) => db.ownerId != createPerms.user.id && db.visibility == "public");
    const othersDbs = fetchedDatabases.filter((db) => db.ownerId != createPerms.user.id && db.visibility != "public");
    const selectedDb = fetchedDatabases.find((db) => db.id == databaseId);
    const selectedDbProvider = selectedDb ? availableServices.find((service) => service.id == selectedDb.provider) : null;
    return <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full gap-2 pt-4">
        <form className="w-full h-full flex flex-col min-h-0" onSubmit={async(e)=>{
            e.preventDefault()
            if (!name || name.trim() == "" || !databaseId){
                setSubmissionError({title: "Missing required fields", message: "Please fill in all required fields before submitting."});
                return;
            }
            if (fetchedApps.find(app => app.name == name)){
                return;
            }
            setIsSubmitting(true);
            setSubmissionError({title: "", message: ""});
            const response = await fetch("/api/dashboard/applications/create", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    description: description.trim() || "No description provided.",
                    databaseId
                })
            });
            try {
                const responseData = await response.json();
                if (!response.ok){
                    setIsSubmitting(false);
                    console.log(responseData);
                    return setSubmissionError({title: responseData.error, message: responseData.message || "An unknown error occurred while creating your application."});
                }
                setIsSubmitting(false);
                toast.add({
                    title: "Application created",
                    description: "Your application has been created successfully.",
                    type: "success",
                });
                router.push("/dashboard/applications/"+responseData.id);
            } catch (error) {
                setIsSubmitting(false);
                console.log(error);
                return setSubmissionError({title: "An unknown error occurred", message: "An unknown error occurred while creating your application."});
            }
        }}>
            {fetchedDatabases.length === 0 && <Link href={dbCreatePerms?.isAuthorised ? "/dashboard/admin/databases/create" : ""}>
                    <Alert variant="destructive" className={`mb-4 ${dbCreatePerms?.isAuthorised ? "cursor-pointer" : "cursor-default"}`}>
                        <OctagonAlert/>
                        <AlertTitle>No available databases to connect.</AlertTitle>
                        <AlertDescription>{dbCreatePerms?.isAuthorised ? "Create a new database, then return back to the form." : "Contact your administrator to create a database, or give you access to one. Once complete, return back to this page."}</AlertDescription>
                    {dbCreatePerms?.isAuthorised && <AlertAction> 
                        <Button size="icon-sm" variant="secondary">
                            <ArrowRight/>
                        </Button>
                    </AlertAction>}
                </Alert>
            </Link>}
            {submissionError.title && <Alert variant="destructive" className="mb-4">
                <OctagonAlert/>
                <AlertTitle>{submissionError.title}</AlertTitle>
                <AlertDescription>{submissionError.message}</AlertDescription>
            </Alert>}
            <div className="w-full h-full overflow-auto p-0.5 space-y-2">
                <Card >
                    <CardHeader>
                        <CardTitle>General</CardTitle>
                        <CardDescription>Information about your new application</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input required disabled={fetchedDatabases.length == 0} type="text" value={name} onChange={(e)=> setName(e.target.value)}/>
                                {fetchedApps.find((app)=> app.name == name.trim()) ? <FieldError>An application with this name already exists.</FieldError> : <FieldDescription>The name of your application. Must be unique.</FieldDescription>}
                            </Field>
                            <Field>
                                <FieldLabel>Description</FieldLabel>
                                <Input disabled={fetchedDatabases.length == 0} type="text" value={description} onChange={(e)=> setDescription(e.target.value)} placeholder="No description provided."/>
                                <FieldDescription>Short description of what this application is used for. Optional.</FieldDescription>
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Database</CardTitle>
                        <CardDescription>Connect your application to a Database</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Database</FieldLabel>
                                <Select required disabled={fetchedDatabases.length == 0} items={fetchedDatabases.map((base) => ({label: base.name, value: base.id}))} value={databaseId} onValueChange={(value) => setDatabaseId(value || "")}>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {personalDbs.length > 0 && <SelectGroup>
                                            <SelectLabel>Your databases</SelectLabel>
                                            {personalDbs.map((base)=>{
                                                return <SelectItem key={base.id} value={base.id}>{base.name}</SelectItem>
                                            })}
                                        </SelectGroup>}
                                        {publicDbs.length > 0 && <SelectGroup>
                                            <SelectLabel>Public databases</SelectLabel>
                                            {publicDbs.map((base)=>{
                                                return <SelectItem key={base.id} value={base.id}>{base.name}</SelectItem>
                                            })}
                                        </SelectGroup>}
                                        {othersDbs.length > 0 && <SelectGroup>
                                            <SelectLabel>Others' Databases</SelectLabel>
                                            {othersDbs.map((base)=>{
                                                return <SelectItem key={base.id} value={base.id}>{base.name}</SelectItem>
                                            })}
                                        </SelectGroup>}
                                    </SelectContent>
                                </Select>
                            </Field>
                            {selectedDb && <Field>
                                <FieldLabel>Database details</FieldLabel>
                                <Item variant="outline" className="mt-3">
                                    <ItemMedia variant="icon">
                                        {selectedDbProvider ? <selectedDbProvider.icon className="size-6"/> : <DatabaseIcon className="size-6"/>}
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>
                                            {selectedDb.name}
                                            <Tooltip>
                                                <TooltipTrigger render={selectedDb.visibility == "public" ? <Eye className="size-3 text-muted-foreground"/> : <Lock className="size-3 text-muted-foreground"/>}/>
                                                <TooltipContent>
                                                    <span className='capitalize'>{selectedDb.visibility}</span>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Badge variant="outline" className="border px-1 py-0.5">
                                                <User data-icon="inline-start"/>
                                                {selectedDb.owner?.name || "Unknown user"}
                                            </Badge>
                                        </ItemTitle>
                                        <div className="mt-1">
                                            <UsageBar files={selectedDb.files || []} limit={selectedDb.limit || 0} alerts={selectedDb.alerts}/>
                                        </div>
                                    </ItemContent>
                                </Item>
                            </Field>}
                        </FieldGroup>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                <Link href="/dashboard/applications">
                    <Button variant="secondary" type="button" className="w-full hidden md:block">
                        Cancel
                    </Button>
                </Link>
                <Button disabled={isSubmitting} className="w-full" type="submit">
                    {createPerms.isAuthorised ? "Create Application" : "Request Application"}
                </Button>
            </div>
        </form>
        <div className='hidden lg:block h-full lg:min-w-[300px] xl:min-w-[450px]'>
            <div className="relative overflow-hidden border dark:border-none dark:bg-transparent flex flex-col h-full items-center justify-center p-4">
                <div className="absolute -z-1 dark:bg-card top-0 left-0 w-full h-full">
                    <DotField
                        key={resolvedTheme}
                        className="opacity-20 h-full"
                        dotRadius={2.5}
                        dotSpacing={14}
                        cursorRadius={0}
                        cursorForce={0}
                        bulgeOnly
                        bulgeStrength={0}
                        glowRadius={0}
                        sparkle={false}
                        waveAmplitude={0}
                        gradientFrom={resolvedTheme == "light" ? "#000" : "#ffffff"}
                        gradientTo={ resolvedTheme == "light" ? "#000" : "#ffffff"}
                        glowColor={resolvedTheme == "light" ? "#fff" : "#000"}
                    />
                </div>
                <p className="uppercase font-medium text-xs absolute top-3 text-muted-foreground">Visualisation</p>
                <Item className="w-max bg-background dark:bg-secondary" variant="outline">
                    <ItemMedia variant="icon">
                        <LaptopMinimal/>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Client</ItemTitle>
                    </ItemContent>
                </Item>
                <div className="my-4 flex flex-col items-center">
                    <div className="w-0 h-3 border border-muted-foreground border-dashed"/>
                    <ArrowDown className="text-muted-foreground size-4"/>
                </div>
                <Item className="w-max bg-background dark:bg-secondary" variant="outline">
                    <ItemMedia variant="icon">
                        <Cloud/>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Unified CDN</ItemTitle>
                    </ItemContent>
                </Item>
                <div className="my-4 flex flex-col items-center">
                    <div className="w-0 h-3 border border-muted-foreground border-dashed"/>
                    <ArrowDown className="text-muted-foreground size-4"/>
                </div>
                <Item className={`${!name && "border-dashed border-2 text-muted-foreground"} w-max bg-background dark:bg-secondary`} variant="outline">
                    <ItemMedia variant="icon">
                        <AppWindowMac/>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>{name || "New application"}</ItemTitle>
                    </ItemContent>
                </Item>
                <div className="my-4 flex flex-col items-center">
                    <div className="w-0 h-3 border border-muted-foreground border-dashed"/>
                    <ArrowDown className="text-muted-foreground size-4"/>
                </div>
                <Item className={`${!databaseId && "border-dashed border-2 text-muted-foreground"} w-max  bg-background dark:bg-secondary`} variant="outline">
                    <ItemMedia variant="icon">
                        <DatabaseIcon/>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>{fetchedDatabases.find((x)=> x.id == databaseId)?.name || "Untitled Database"}</ItemTitle>
                    </ItemContent>
                </Item>
            </div>
        </div>
    </div>
}