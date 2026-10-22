import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { Database } from "lucide-react";
import Link from "next/link";
import DatabaseItem from "./DatabaseItem";
import { Label } from "@/components/ui/label";

export default async function DatabasesRendered({searchParams}: {searchParams: Promise<{layout?: string | undefined}>}){
    const viewAllDbPerms = await userHasPermissionServer({databases: ["viewAll"]});
    const fetchedDbs = await db.query.databases.findMany({
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
            }
        },
        columns: {
            keys: false
        },
        where: {
            OR: [
                {ownerId: !viewAllDbPerms.isAuthorised ? viewAllDbPerms.user.id : {isNotNull: true}},
                {visibility: "public"}
            ]
        },
        orderBy: {
            updatedAt: "desc"
        }
    })
    const personalDbs = fetchedDbs.filter((db) => db.ownerId == viewAllDbPerms.user.id);
    const publicDbs = fetchedDbs.filter((db) => db.ownerId != viewAllDbPerms.user.id && db.visibility == "public");
    const othersDbs = fetchedDbs.filter((db) => db.ownerId != viewAllDbPerms.user.id && db.visibility != "public");
    const { layout } = await searchParams;
    return fetchedDbs.length > 0 ? <>
        <Label className="text-sm mt-8">Created by you</Label>
        {personalDbs.length > 0 ? <div className={`grid ${layout == 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'} mt-3`}>
            {personalDbs.map((db, index) => <DatabaseItem length={personalDbs.length} key={db.id} index={index} db={db} layout={layout || 'grid'}/>)}
        </div> : <Empty className="border mt-4 h-full flex-0">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Database/>
                </EmptyMedia>
                <EmptyTitle>No databases yet</EmptyTitle>
                <EmptyDescription>You havent created your own database yet. Get started by creating one below.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button nativeButton={false} render={<Link href="/dashboard/admin/databases/create"/>}>Create Database</Button>
            </EmptyContent>
        </Empty>}
        <Label className="text-sm mt-8">Other public databases</Label>
        {publicDbs.length > 0 ? <div className={`grid ${layout == 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'} mt-3`}>
            {publicDbs.map((db, index) => <DatabaseItem length={publicDbs.length} key={db.id} index={index} db={db} layout={layout || 'grid'}/>)}
        </div> : <Empty className="border mt-4 h-full flex-0">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Database/>
                </EmptyMedia>
                <EmptyTitle>No databases yet</EmptyTitle>
                <EmptyDescription>No one else has made a public database yet.</EmptyDescription>
            </EmptyHeader>
        </Empty>}
        {viewAllDbPerms.isAuthorised && <>
        <Label className="text-sm mt-8">Other users</Label>
        {othersDbs.length > 0 ? <div className={`grid ${layout == 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'} mt-3`}>
            {othersDbs.map((db, index) => <DatabaseItem length={othersDbs.length} key={db.id} index={index} db={db} layout={layout || 'grid'}/>)}
        </div> : <Empty className="border mt-4">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Database/>
                </EmptyMedia>
                <EmptyTitle>No databases yet</EmptyTitle>
                <EmptyDescription>No one else has created a database.</EmptyDescription>
            </EmptyHeader>
        </Empty>}
        </>}
    </>: <Empty className="border mt-4 h-full">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <Database/>
            </EmptyMedia>
            <EmptyTitle>No databases yet</EmptyTitle>
            <EmptyDescription>You don't have a database yet. Get started by creating one below.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button nativeButton={false} render={<Link href="/dashboard/admin/databases/create"/>}>Create Database</Button>
        </EmptyContent>
    </Empty>;
}
