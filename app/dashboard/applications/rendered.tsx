import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissionHelpers";
import { Database } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import ApplicationItem from "./ApplicationItem";

export default async function ApplicationRendered({searchParams}: {searchParams: Promise<{layout?: string | undefined}>}){
    const viewAllAppsPerms = await userHasPermissionServer({applications: ["viewAll"]});
    const fetchedApps = await db.query.applications.findMany({
        with: {
            files: {
                columns: {
                    size: true
                }
            },
            owner: {
                columns: {
                    name: true,
                }
            },
            database: {
                columns: {
                    id: true,
                    name: true,
                    provider: true
                }
            }
        },
        where: {
            ownerId: !viewAllAppsPerms.isAuthorised ? viewAllAppsPerms.user.id : {isNotNull: true}
        },
        orderBy: {
            updatedAt: "desc"
        }
    })
    const personalApps = fetchedApps.filter((app) => app.ownerId == viewAllAppsPerms.user.id);
    const othersApps = fetchedApps.filter((app) => app.ownerId != viewAllAppsPerms.user.id);
    const { layout } = await searchParams;
    return fetchedApps.length > 0 ? <>
        <Label className="text-sm mt-8">Created by you</Label>
        {personalApps.length > 0 ? <div className={`grid ${layout == 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'} mt-3`}>
            {personalApps.map((app, index) => <ApplicationItem showUserAndDB={viewAllAppsPerms.isAuthorised} length={personalApps.length} key={app.id} index={index} app={app} layout={layout || 'grid'}/>)}
        </div> : <Empty className="border mt-4 h-full">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Database/>
                </EmptyMedia>
                <EmptyTitle>No applications yet</EmptyTitle>
                <EmptyDescription>You havent created your own application yet. Get started by creating one below.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button nativeButton={false} render={<Link href="/dashboard/applications/create"/>}>Create Application</Button>
            </EmptyContent>
        </Empty>}
        {viewAllAppsPerms.isAuthorised && <>
        <Label className="text-sm mt-8">Other users</Label>
        {othersApps.length > 0 ? <div className={`grid ${layout == 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'} mt-3`}>
            {othersApps.map((app, index) => <ApplicationItem showUserAndDB={viewAllAppsPerms.isAuthorised} length={othersApps.length} key={app.id} index={index} app={app} layout={layout || 'grid'}/>)}
        </div> : <Empty className="border mt-4">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Database/>
                </EmptyMedia>
                <EmptyTitle>No applications yet</EmptyTitle>
                <EmptyDescription>No one else has created an application.</EmptyDescription>
            </EmptyHeader>
        </Empty>}
        </>}
    </>: <Empty className="border mt-4 h-full">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <Database/>
            </EmptyMedia>
            <EmptyTitle>No applications yet</EmptyTitle>
            <EmptyDescription>You havent created a applications yet. Get started by creating one below.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button nativeButton={false} render={<Link href="/dashboard/applications/create"/>}>Create Application</Button>
        </EmptyContent>
    </Empty>;
}
