'use client';
import FilesByTypeChart from "@/components/charts/FilesByTypeChart";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Database } from "@/lib/schema/schemaTypes";
import { useState } from "react";

export default function RenderedClientDbOverviewPage({data}: {data: Omit<Database, "keys"> & {files: {name: string, size: number, contentType: string}[]}}){
    const [showByLimit, setShowByLimit] = useState(true);
    return <div className="flex flex-col gap-4 pt-4 px-0.5 scroll-fade h-full overflow-auto pb-4">
        <div className="flex gap-4">
            <Card size="sm" className="w-full min-w-[300px] max-w-[350px]">
                <CardHeader>
                    <CardTitle>Usage by type</CardTitle>
                </CardHeader>
                <CardContent>
                    <FilesByTypeChart showByLimit={showByLimit} files={data.files} limit={data.limit}/>
                </CardContent>
                {data.limit > 0 && <CardFooter>
                    <Field orientation="horizontal">
                        <FieldLabel htmlFor="show-by-limit">Show available</FieldLabel>
                        <Checkbox id="show-by-limit" checked={showByLimit} onCheckedChange={(value)=> setShowByLimit(!!value)}/>
                    </Field>
                </CardFooter>}
            </Card>
            <Card size="sm" className="w-full">
                <CardHeader>
                    <CardTitle>Usage details</CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
            </Card>
        </div>
    </div>
}