'use client';
import DbAnalyticsChart from "@/components/charts/DbAnalyticsChart";
import FilesByTypeChart from "@/components/charts/FilesByTypeChart";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsEventType } from "@/lib/actions/analytics/eventTypes";
import { AppAnalytics, Database } from "@/lib/schema/schemaTypes";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function RenderedClientDbOverviewPage({data}: {data: Omit<Database, "keys"> & {files: {name: string, size: number, contentType: string}[], applications: {id: string, name: string, appAnalytics: AppAnalytics[]}[]}}){
    const [showByLimit, setShowByLimit] = useState(data.limit > 0);
    const [showLimitLine, setShowLimitLine] = useState(false);
    const [showOverall, setShowOverall] = useState(true);
    const [analyticsType, setAnalyticsType] = useState<AnalyticsEventType>("size");
    const [shownApps, setShownApps] = useState(data.applications.map((app)=> app.id))
    const filteredAnalytics = data.applications.filter((app)=> shownApps.includes(app.id)).flatMap((app)=> app.appAnalytics.filter((analytics)=> analytics.type === analyticsType))
    return <div className="flex flex-col gap-4 pt-4 px-0.5 scroll-fade h-full overflow-auto pb-4">
        <div className="flex gap-4">
            <Card size="sm" className="w-full min-w-[300px] max-w-[350px]">
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
                <CardHeader>
                    <CardTitle>Usage trends</CardTitle>
                    <CardDescription>Up to last 30 days</CardDescription>
                    <CardAction className="flex items-center">
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
                        <Combobox items={data.applications.map((app)=> ({label: app.name, value: app.id}))} multiple value={shownApps} autoHighlight onValueChange={(value)=> setShownApps(value)}>
                            <ComboboxTrigger render={<Button variant="ghost" size="sm">{shownApps.length == data.applications.length ? "All apps shown" : `${shownApps.length} Apps shown`} <ChevronDown/></Button>}/>
                            <ComboboxContent align="end" className="w-2xs">
                                <ComboboxInput showTrigger={false} placeholder="Search" />
                                <ComboboxEmpty>No applications found</ComboboxEmpty>
                                <ComboboxList>
                                    {(item)=>{
                                        return <ComboboxItem key={item.value} value={item.value}>
                                            {item.label}
                                        </ComboboxItem>
                                    }}
                                </ComboboxList>
                            </ComboboxContent>        
                        </Combobox>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button>}/>
                            <DropdownMenuContent align="end">
                                <DropdownMenuCheckboxItem checked={showOverall} onCheckedChange={(value)=> setShowOverall(!!value)}>Show overall</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem disabled={data.limit <= 0} checked={showLimitLine} onCheckedChange={(value)=> setShowLimitLine(!!value)}>Show limit line</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <DbAnalyticsChart limit={data.limit} alerts={data.alerts} showLimit={showLimitLine} showOverall={showOverall} data={filteredAnalytics} apps={data.applications.filter((app)=> shownApps.includes(app.id))} createdAt={data.createdAt}/>
                </CardContent>
            </Card>
        </div>
    </div>
}