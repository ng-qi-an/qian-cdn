'use client';
import DashboardChart from "@/components/charts/DashboardChart";
import DbAnalyticsChart from "@/components/charts/DbAnalyticsChart";
import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsEventType } from "@/lib/actions/analytics/eventTypes";
import { AppAnalytics, Application, Database, User } from "@/lib/schema/schemaTypes";
import { getDateRange } from "@/lib/time";
import { convertFromBytesToSensible } from "@/lib/unitConverter";
import { AppWindowMac, CalendarDays, ChevronDown, DatabaseIcon, FolderClosed, MoreHorizontal, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ClientRenderedDashboardPage({view, isAdmin, user, fetchedApps, fetchedDbs}: {view: string, isAdmin: boolean, user: User, fetchedApps: (Application & {files: {size: number, createdAt: Date}[], appAnalytics: AppAnalytics[]})[], fetchedDbs: (Database & {files: {size: number, createdAt: Date}[]})[]}){
    const {start: startDate, end: endDate} = getDateRange(new Date(), 1, process.env.NEXT_PUBLIC_TIMEZONE!);
    const allAppFiles = fetchedApps.flatMap((app)=> app.files)
    const allDbFiles = fetchedDbs.flatMap((db)=> db.files)
    const convertedAppFilesSize = convertFromBytesToSensible(allAppFiles.reduce((acc, file)=> acc + file.size, 0))
    const convertedDbFilesSize = convertFromBytesToSensible(allDbFiles.reduce((acc, file)=> acc + file.size, 0))
    const todayAppFiles = allAppFiles.filter((file)=> file.createdAt >= startDate && file.createdAt <= endDate).toSorted((a, b)=> a.createdAt.getTime() - b.createdAt.getTime())
    
    const [showOverall, setShowOverall] = useState(true);
    const [analyticsType, setAnalyticsType] = useState<AnalyticsEventType>("size");
    const [shownApps, setShownApps] = useState(fetchedApps.map((app)=> app.id))
    const filteredAnalytics = fetchedApps.filter((app)=> shownApps.includes(app.id)).flatMap((app)=> app.appAnalytics.filter((analytics)=> analytics.type === analyticsType))

    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Dashboard", href: "/"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title={`Welcome back, ${user.name}`} description={(view != "personal" || !isAdmin) ? "Here's an admin overview of the platform." :  "Here's what's happening for you today."} actionRender={isAdmin && <Link href={view == "personal" ? "/dashboard" : "/dashboard?view=personal"}>
                <Button size="sm" variant="secondary">
                    {view == "personal" ? "Return to overview" : "View personal"}
                </Button>
            </Link>}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mt-6 w-full">
                <Card size="sm" className="gap-4">
                    <CardHeader>
                        <CardDescription>Total files</CardDescription>
                        <CardTitle className="text-2xl font-semibold">{allAppFiles.length}</CardTitle>
                        <CardAction>
                            <FolderClosed className="size-4"/>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <p className="font-medium text-muted-foreground">Across {fetchedApps.length} application{fetchedApps.length != 1 && "s"}</p>
                    </CardFooter>
                </Card>
                <Card size="sm" className="gap-4">
                    <CardHeader>
                        <CardDescription>Uploaded today</CardDescription>
                        <CardTitle className="text-2xl font-semibold">{todayAppFiles.length}</CardTitle>
                        <CardAction>
                            <CalendarDays className="size-4"/>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <p className="font-medium text-muted-foreground">{todayAppFiles[0] ? `First file at ${todayAppFiles[0].createdAt.toLocaleTimeString(undefined, {hour: "2-digit"})}` : "No files uploaded today"}</p>
                    </CardFooter>
                </Card>
                <Card size="sm" className="gap-4">
                    <CardHeader>
                        <CardDescription>Storage used</CardDescription>
                        <CardTitle className="text-2xl font-semibold ">{convertedAppFilesSize.value.toFixed(2)}{convertedAppFilesSize.unit}</CardTitle>
                        <CardAction>
                            <AppWindowMac className="size-4"/>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <p className="font-medium text-muted-foreground">Across {fetchedApps.length} app{fetchedApps.length != 1 && "s"}</p>
                    </CardFooter>
                </Card>
                <Card size="sm" className="gap-4">
                    <CardHeader>
                        <CardDescription>Database storage</CardDescription>
                        <CardTitle className="text-2xl font-semibold ">{convertedDbFilesSize.value.toFixed(2)}{convertedDbFilesSize.unit}</CardTitle>
                        <CardAction>
                            <DatabaseIcon className="size-4"/>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <p className="font-medium text-muted-foreground">Across {fetchedDbs.length} database{fetchedDbs.length != 1 && "s"}</p>
                    </CardFooter>
                </Card>
            </div>
            <div className="flex mt-6 gap-4 flex-col xl:flex-row w-full">
                <Card size="sm" className="w-full">
                    <CardHeader>
                        <CardTitle className="normal-case tracking-normal">Storage</CardTitle>
                        <CardDescription>Measured from last 30 days</CardDescription>
                        <CardAction>
                            <Combobox items={fetchedApps.map((app)=> ({label: app.name, value: app.id}))} multiple value={shownApps} autoHighlight onValueChange={(value)=> setShownApps(value)}>
                                <ComboboxTrigger render={<Button variant="ghost" size="sm">{shownApps.length == fetchedApps.length ? "All apps shown" : `${shownApps.length} Apps shown`} <ChevronDown/></Button>}/>
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
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardAction>
                    </CardHeader>
                    <div className="px-4">
                        <DbAnalyticsChart limitHeight showOverall={showOverall} data={filteredAnalytics} apps={fetchedApps.filter((app)=> shownApps.includes(app.id))} createdAt={fetchedDbs.length > 0 ? fetchedDbs.toSorted((a, b)=> a.createdAt.getTime() - b.createdAt.getTime())[0].createdAt : fetchedApps.length > 0 ? fetchedDbs.toSorted((a, b)=> a.createdAt.getTime() - b.createdAt.getTime())[0].createdAt : new Date()}/>
                    </div>
                </Card>
                <Tabs value={analyticsType} onValueChange={(x)=> setAnalyticsType(x)}>
                    <Card size="sm" className="w-full xl:w-100 gap-1 h-full">
                        <CardHeader>
                            <CardTitle className="normal-case tracking-normal">Usage</CardTitle>
                            <CardDescription>Showing records as of today</CardDescription>
                        </CardHeader>
                        <TabsList variant="line" className="px-3">
                            <TabsTrigger value="size">Storage</TabsTrigger>
                            <TabsTrigger value="requests">Requests</TabsTrigger>
                            <TabsTrigger value="files">Files</TabsTrigger>
                        </TabsList>
                        <TabsContent value="size">
                            <div className="h-40 w-full bg-muted rounded-md"/>
                        </TabsContent>
                        <TabsContent value="requests">
                            <div className="h-40 w-full bg-muted rounded-md"/>
                        </TabsContent>
                        <TabsContent value="files">
                            <div className="h-40 w-full bg-muted rounded-md"/>
                        </TabsContent>
                    </Card>
                </Tabs>
            </div>
            <Card size="sm" className="w-full mt-6">
                <CardHeader>
                    <CardTitle className="normal-case tracking-normal">Recent activity</CardTitle>
                    <CardDescription>Measured from last 30 days</CardDescription>
                </CardHeader>
            </Card>
        </DashboardBody>
    </Dashboard>
}