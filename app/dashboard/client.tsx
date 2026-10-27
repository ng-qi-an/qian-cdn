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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsEventType } from "@/lib/actions/analytics/eventTypes";
import { AppAnalytics, Application, Database, User } from "@/lib/schema/schemaTypes";
import { getDateRange } from "@/lib/time";
import { convertFromBytesToSensible } from "@/lib/unitConverter";
import { AppWindowMac, CalendarDays, ChevronDown, DatabaseIcon, FolderClosed, MoreHorizontal, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClientRenderedDashboardPage({adminView, isAdmin, user, fetchedApps, fetchedDbs}: {adminView: boolean, isAdmin: boolean, user: User, fetchedApps: (Application & {files: {size: number, createdAt: Date}[], appAnalytics: AppAnalytics[]})[], fetchedDbs: (Database & {files: {size: number, createdAt: Date}[]})[]}){
    const {start: startDate, end: endDate} = getDateRange(new Date(), 1, process.env.NEXT_PUBLIC_TIMEZONE!);
    const allAppFiles = fetchedApps.flatMap((app)=> app.files)
    const allDbFiles = fetchedDbs.flatMap((db)=> db.files)
    const convertedAppFilesSize = convertFromBytesToSensible(allAppFiles.reduce((acc, file)=> acc + file.size, 0))
    const convertedDbFilesSize = convertFromBytesToSensible(allDbFiles.reduce((acc, file)=> acc + file.size, 0))
    const todayAppFiles = allAppFiles.filter((file)=> file.createdAt >= startDate && file.createdAt <= endDate).toSorted((a, b)=> a.createdAt.getTime() - b.createdAt.getTime())
    
    const [showOverall, setShowOverall] = useState(true);
    const [analyticsType, setAnalyticsType] = useState<AnalyticsEventType>("size");
    const [shownApps, setShownApps] = useState(fetchedApps.map((app)=> app.id))
    useEffect(()=>{
        setShownApps(fetchedApps.map((app)=> app.id))
    }, [fetchedApps])
    const filteredAnalytics = fetchedApps.filter((app)=> shownApps.includes(app.id)).flatMap((app)=> app.appAnalytics.filter((analytics)=> analytics.type === analyticsType))

    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Dashboard", href: "/"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title={`Welcome back, ${user.name}`} description={(adminView) ? "Here's an admin overview of the platform." :  "Here's what's happening for you today."} actionRender={isAdmin && <Link href={adminView ? "/dashboard" : "/dashboard?view=admin"}>
                <Button size="sm" variant="secondary">
                    {!adminView ? "Admin view" : "Personal view"}
                </Button>
            </Link>}/>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} mt-6 w-full`}>
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
                <Card size="sm" className={`gap-4 ${!isAdmin && 'sm:col-span-2 xl:col-span-1'}`}>
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
                {isAdmin && <Card size="sm" className="gap-4">
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
                </Card>}
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
                        <DbAnalyticsChart limitHeight showOverall={showOverall} data={filteredAnalytics} apps={fetchedApps.filter((app)=> shownApps.includes(app.id))} createdAt={fetchedDbs.length > 0 ? fetchedDbs.toSorted((a, b)=> a.createdAt.getTime() - b.createdAt.getTime())[0].createdAt : fetchedApps.length > 0 ? fetchedApps.toSorted((a, b)=> a.createdAt.getTime() - b.createdAt.getTime())[0].createdAt : new Date()}/>
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
                        <TabsContent value="size" className="px-4 space-y-2 pt-2">
                            {fetchedApps.toSorted((a, b) => (b.appAnalytics.filter((analytics)=> analytics.type == analyticsType).at(-1)?.value ?? 0) - (a.appAnalytics.filter((analytics)=> analytics.type == analyticsType).at(-1)?.value ?? 0)).slice(0, 5).map((app) => {
                                const latestAnalytics = app.appAnalytics.filter((analytics)=> analytics.type == analyticsType).at(-1);
                                const convertedSize = latestAnalytics ? convertFromBytesToSensible(latestAnalytics.value) : null;
                                return latestAnalytics ? <Item key={app.id} variant="outline" size="sm">
                                    <ItemContent>
                                        <ItemTitle>{app.name}</ItemTitle>
                                    </ItemContent>
                                    <ItemActions>
                                        <span className="font-medium">{convertedSize?.value.toFixed(2)} {convertedSize?.unit.toUpperCase()}</span>
                                    </ItemActions>
                                </Item>: null;
                            })}
                            {fetchedApps.length > 5 && <p className="text-sm text-muted-foreground">Showing top 5 applications by storage usage</p>}
                        </TabsContent>
                        <TabsContent value="requests" className="px-4 space-y-2 pt-2">
                            {fetchedApps.toSorted((a, b) => (b.appAnalytics.filter((analytics)=> analytics.type == analyticsType).at(-1)?.value ?? 0) - (a.appAnalytics.filter((analytics)=> analytics.type == analyticsType).at(-1)?.value ?? 0)).slice(0, 5).map((app) => {
                                const latestAnalytics = app.appAnalytics.find((analytics)=> analytics.type == analyticsType && analytics.startDate >= startDate);
                                return latestAnalytics ? <Item key={app.id} variant="outline" size="sm">
                                    <ItemContent>
                                        <ItemTitle>{app.name}</ItemTitle>
                                    </ItemContent>
                                    <ItemActions>
                                        <span className="font-medium">{latestAnalytics.value}</span>
                                    </ItemActions>
                                </Item>: null;
                            })}
                            {fetchedApps.length > 5 && <p className="text-sm text-muted-foreground">Showing top 5 applications by requests today</p>}
                        </TabsContent>
                        <TabsContent value="files" className="px-4 space-y-2 pt-2">
                            {fetchedApps.toSorted((a, b) => (b.appAnalytics.filter((analytics)=> analytics.type == analyticsType).at(-1)?.value ?? 0) - (a.appAnalytics.filter((analytics)=> analytics.type == analyticsType).at(-1)?.value ?? 0)).slice(0, 5).map((app) => {
                                const latestAnalytics = app.appAnalytics.filter((analytics)=> analytics.type == analyticsType).at(-1);
                                return latestAnalytics ? <Item key={app.id} variant="outline" size="sm">
                                    <ItemContent>
                                        <ItemTitle>{app.name}</ItemTitle>
                                    </ItemContent>
                                    <ItemActions>
                                        <span className="font-medium">{latestAnalytics.value}</span>
                                    </ItemActions>
                                </Item>: null;
                            })}
                            {fetchedApps.length > 5 && <p className="text-sm text-muted-foreground">Showing top 5 applications by number of files</p>}
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