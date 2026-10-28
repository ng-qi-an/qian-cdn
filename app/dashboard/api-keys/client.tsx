'use client';
import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import KeysList from "../applications/[id]/api-keys/KeysList";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import CreateKeyDialog from "../applications/[id]/api-keys/CreateKeyDialog";
import { apikey } from "@/lib/schema/auth-schema";
import { Label } from "@/components/ui/label";

export default function ClientApiKeysPage({sortedApiKeys, fetchedApps, showAllApps, userId}: {sortedApiKeys: {[appId: string] : Omit<typeof apikey.$inferSelect, "key">[]}, fetchedApps: {id: string, name: string, status: string, owner: {id: string, name: string} | null}[], showAllApps: boolean, userId?: string}){
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "API Keys"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title="API Keys" description={showAllApps ? "Manage all API keys on the platform" : `Manage your API keys for all your applications.`} actionRender={<>
                <Link href={showAllApps ? "/dashboard/api-keys" : "/dashboard/api-keys?view=admin"}>
                    <Button size="sm" className="h-10" variant="secondary">
                        {!showAllApps ? "Admin view" : "Personal view"}
                    </Button>
                </Link>
                <Button size="sm" className="h-10" onClick={()=> setShowCreateDialog(true)}>
                    <Plus/>
                    Create new
                </Button>
            </>}/>
            <CreateKeyDialog isOpen={showCreateDialog} onOpenChange={setShowCreateDialog} fetchedApps={fetchedApps} appId={null}/>
            <div className="h-full overflow-auto scroll-fade pt-6">
                <Label className="text-sm mt-0 mb-2">Created by you</Label>
                <div className="w-full gap-2 grid p-1 lg:grid-cols-2 xl:grid-cols-2">
                    {Object.keys(sortedApiKeys).map((appId)=>{
                        const app = fetchedApps.find(app => app.id === appId);
                        return app && app.owner?.id === userId && sortedApiKeys[appId].length > 0 && <Card key={app.id} size="sm" className="h-max">
                            <CardHeader>
                                <CardTitle className="w-full">
                                    <Link href={`/dashboard/applications/${app.id}`} className="flex items-center gap-2 hover:underline">
                                        {app?.name ?? "Unknown app"}
                                        <div className="flex-1"/>
                                        <ExternalLink className="size-4 text-muted-foreground"/>
                                    </Link>
                                </CardTitle>    
                                {showAllApps && <CardDescription>Owned by {app.owner?.name}</CardDescription>}
                            </CardHeader>
                            <CardContent>
                                <KeysList appId={appId} disableCreate={app?.status != "active"} apiKeys={sortedApiKeys[appId]} showFooter={false}/>
                            </CardContent>
                        </Card>
                    })}
                </div>
                {showAllApps && <>
                    <Label className="text-sm mt-8 mb-2">Other users</Label>
                    <div className="w-full gap-2 grid p-1 lg:grid-cols-2 xl:grid-cols-2">
                        {Object.keys(sortedApiKeys).map((appId)=>{
                            const app = fetchedApps.find(app => app.id === appId);
                            return app && app.owner?.id !== userId && sortedApiKeys[appId].length > 0 && <Card key={app.id} size="sm" className="h-max">
                                <CardHeader>
                                    <CardTitle className="w-full">
                                        <Link href={`/dashboard/applications/${app.id}`} className="flex items-center gap-2 hover:underline">
                                            {app?.name ?? "Unknown app"}
                                            <div className="flex-1"/>
                                            <ExternalLink className="size-4 text-muted-foreground"/>
                                        </Link>
                                    </CardTitle>    
                                    {showAllApps && <CardDescription>Owned by {app.owner?.name}</CardDescription>}
                                </CardHeader>
                                <CardContent>
                                    <KeysList appId={appId} disableCreate={app?.status != "active"} apiKeys={sortedApiKeys[appId]} showFooter={false}/>
                                </CardContent>
                            </Card>
                        })}
                    </div>
                </>}
            </div>
        </DashboardBody>
    </Dashboard>
}