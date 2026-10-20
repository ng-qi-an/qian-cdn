import { db } from "@/lib/db"
import { userHasPermissionServer } from "@/lib/permissionHelpers"
import { RenderedLogsPageClient } from "./client"

export default async function RenderedLogsPage() {
    const viewAllPerms = await userHasPermissionServer({applications: ["viewAll"]})
    const apps = await db.query.applications.findMany({
        where: {
            ownerId: !viewAllPerms.isAuthorised ? viewAllPerms.user?.id : {isNotNull: true}
        },
        columns: {
            id: true,
            name: true,
        },
        with: {
            appLogs: {
                with: {
                    fromUser: true,
                    fromApiKey: true
                }
            },
            database: {
                columns: {
                    provider: true
                }
            }
        }
    })
    const appLogs = apps.flatMap(app => app.appLogs.map(log => ({...log, application: {id: app.id, name: app.name, database: {provider: app.database?.provider}}}))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return <RenderedLogsPageClient logs={appLogs} showUserLink={viewAllPerms.isAuthorised}/>
}
