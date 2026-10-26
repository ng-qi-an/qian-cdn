'use client';
import DbAnalyticsChart from "@/components/charts/DbAnalyticsChart";
import FilesByTypeChart from "@/components/charts/FilesByTypeChart";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { AppAnalytics, Database } from "@/lib/schema/schemaTypes";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function RenderedClientDbOverviewPage({data}: {data: Omit<Database, "keys"> & {files: {name: string, size: number, contentType: string}[], applications: {id: string, name: string, appAnalytics: AppAnalytics[]}[]}}){
    const [showByLimit, setShowByLimit] = useState(data.limit > 0);
    const [showLimitLine, setShowLimitLine] = useState(false);
    const [showOverall, setShowOverall] = useState(true);
    return <div className="flex flex-col gap-4 pt-4 px-0.5 scroll-fade h-full overflow-auto pb-4">
        <div className="flex gap-4">
            <Card size="sm" className="w-full min-w-[300px] max-w-[350px]">
                <CardHeader>
                    <CardTitle>Usage by type</CardTitle>
                    <CardAction>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon"><MoreHorizontal/></Button>}/>
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
                    <CardAction>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon"><MoreHorizontal/></Button>}/>
                            <DropdownMenuContent align="end">
                                <DropdownMenuCheckboxItem checked={showOverall} onCheckedChange={(value)=> setShowOverall(!!value)}>Show overall</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem disabled={data.limit <= 0} checked={showLimitLine} onCheckedChange={(value)=> setShowLimitLine(!!value)}>Show limit line</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <DbAnalyticsChart limit={data.limit} alerts={data.alerts} showLimit={showLimitLine} showOverall={showOverall} data={data.applications.flatMap((app)=> app.appAnalytics)} apps={data.applications} createdAt={data.createdAt}/>
                </CardContent>
            </Card>
        </div>
    </div>
}