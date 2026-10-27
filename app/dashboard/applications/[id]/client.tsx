'use client';
import DbAnalyticsChart from "@/components/charts/DbAnalyticsChart";
import FilesByTypeChart from "@/components/charts/FilesByTypeChart";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsEventType } from "@/lib/actions/analytics/eventTypes";
import { authClient } from "@/lib/auth-client";
import { AppAnalytics, Application } from "@/lib/schema/schemaTypes";
import { availableServices } from "@/lib/services";
import { MoreHorizontal, Pen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ApproveDenyButtons from "../ApproveDenyButtons";

export default function RenderedClientAppOverviewPage({data}: {data: Application & {files: {name: string, size: number, contentType: string}[], appAnalytics: AppAnalytics[], owner: {name: string, id: string} | null, database: {name: string, id: string, provider: string} | null}}){
    const [showByLimit, setShowByLimit] = useState(data.limit > 0);
    const [showLimitLine, setShowLimitLine] = useState(false);
    const [analyticsType, setAnalyticsType] = useState<AnalyticsEventType>("size");
    const dbProvider = availableServices.find((service)=> service.id == data.database?.provider);
    const [canApprove, setCanApprove] = useState(false);
    useEffect(()=>{
        (async ()=>{
            const response = await authClient.admin.hasPermission({
                permissions: {
                    applications: ["reviewRequests"]
                }
            })
            console.log(response)
            if (response.data?.success) {
                setCanApprove(response.data.success);
            }
        })();
    }, [])
    return <div className="flex flex-col h-full gap-4 pt-4 px-0.5 pb-4 overflow-auto">
        {data.status == "requested" && 
            <Alert>
                <AlertTitle>Application is pending</AlertTitle>
                <AlertDescription>{canApprove ? `Description: \n ${data.description}` : "Your application is still pending approval. Check back later for updates."}</AlertDescription>
                {canApprove && <AlertAction>
                    <ApproveDenyButtons appId={data.id}/>
                </AlertAction>}
            </Alert>
        }
        <Card size="sm" className="w-full shrink-0">
            <CardHeader>
                <CardTitle>Application details</CardTitle>
                <CardAction>
                    <Link href={`/dashboard/applications/${data.id}/settings`}><Button variant="ghost" size="icon-sm"><Pen/></Button></Link>
                </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2">
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <p className="text-foreground">{data.name}</p>
                        </Field>
                        <Field>
                            <FieldLabel>Owner</FieldLabel>
                            <p className="text-foreground">{data.owner ? data.owner.name : "No owner"}</p>
                        </Field>
                    </FieldGroup>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Database</FieldLabel>
                            <p className="text-foreground flex items-center gap-2">{dbProvider && <dbProvider.icon/>}{data.database?.name}</p>
                        </Field>
                        <Field>
                            <FieldLabel>Provider</FieldLabel>
                            <p className="text-foreground">{dbProvider?.name}</p>
                        </Field>
                    </FieldGroup>
                </div>
            </CardContent>
        </Card>
        <div className="flex gap-4">
            <Card size="sm" className="w-full min-w-[300px] lg:max-w-[350px]">
                <CardHeader>
                    <CardTitle>Usage by type</CardTitle>
                    <CardAction>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button>}/>
                            <DropdownMenuContent align="end">
                                <DropdownMenuCheckboxItem disabled={data.limit <= 0} checked={showByLimit} onCheckedChange={(value)=> setShowByLimit(!!value)}>Show available</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <FilesByTypeChart showByLimit={showByLimit} files={data.files} limit={data.limit}/>
                </CardContent>
            </Card>
            <Card size="sm" className="w-full">
                <CardHeader className="flex flex-col lg:grid">
                    <CardTitle>Usage trends</CardTitle>
                    <CardDescription>Up to last 30 days</CardDescription>
                    <CardAction className="flex items-center mt-2 lg:mt-0">
                        <Select items={[{label: "Size", value: "size"}, {label: "Requests", value: "requests"}, {label: "Files", value: "files"}]} value={analyticsType} onValueChange={(value)=> setAnalyticsType(value as AnalyticsEventType)}>
                            <SelectTrigger className="min-w-max border-b-0 text-xs px-4" size="sm" render={<Button variant="ghost" size="sm"/>}>
                                <SelectValue className="mr-0"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="size">Size</SelectItem>
                                <SelectItem value="requests">Requests</SelectItem>
                                <SelectItem value="files">Files</SelectItem>
                            </SelectContent>
                        </Select>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button>}/>
                            <DropdownMenuContent align="end">
                                <DropdownMenuCheckboxItem disabled={data.limit <= 0} checked={showLimitLine} onCheckedChange={(value)=> setShowLimitLine(!!value)}>Show limit line</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                </CardHeader>
                <CardContent className="h-full">
                    <DbAnalyticsChart limitHeight limit={data.limit} alerts={data.alerts} showLimit={showLimitLine} showOverall={false} data={data.appAnalytics.filter((analytics)=> analytics.type == analyticsType)} apps={[data]} createdAt={data.createdAt}/>
                </CardContent>
            </Card>
        </div>
    </div>
}