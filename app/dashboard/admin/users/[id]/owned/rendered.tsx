import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import DatabaseItem from "../../../databases/DatabaseItem";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Database } from "lucide-react";
import ApplicationItem from "@/app/dashboard/applications/ApplicationItem";

export default async function RenderedUserOwnedPage({params, searchParams}: {params: Promise<{id: string}>, searchParams: Promise<{layout?: string | undefined}>}){
    const { id } = await params;
    const { layout } = await searchParams;
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
            ownerId: id
        },
        orderBy: {
            updatedAt: "desc"
        }
    })
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
            ownerId: id
        },
        orderBy: {
            updatedAt: "desc"
        }
    })
    return <div className="h-full min-h-0 overflow-auto p-0.5">
        <Label className="text-sm mt-8">Databases</Label>
        {fetchedDbs.length > 0 ? <div className={`grid ${layout == 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'} mt-3`}>
            {fetchedDbs.map((db, index) => <DatabaseItem length={fetchedDbs.length} key={db.id} index={index} db={db} layout={layout || 'grid'}/>)}
        </div> : <Empty className="border mt-4">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Database/>
                </EmptyMedia>
                <EmptyTitle>No databases yet</EmptyTitle>
                <EmptyDescription>This user has not created any databases yet.</EmptyDescription>
            </EmptyHeader>
        </Empty>}
        <Label className="text-sm mt-8">Applications</Label>
        {fetchedApps.length > 0 ? <div className={`grid ${layout == 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'} mt-3`}>
            {fetchedApps.map((app, index) => <ApplicationItem showUserAndDB={true} length={fetchedApps.length} key={app.id} index={index} app={app} layout={layout || 'grid'}/>)}
        </div> : <Empty className="border mt-4">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Database/>
                </EmptyMedia>
                <EmptyTitle>No applications yet</EmptyTitle>
                <EmptyDescription>This user has not created any applications yet.</EmptyDescription>
            </EmptyHeader>
        </Empty>}
    </div>
}