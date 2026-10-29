import { db } from "@/lib/db"
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers"
import { RenderedLogsPageClient } from "./client"

export default async function RenderedLogsPage() {
    const viewAllPerms = await userHasPermissionServer({applications: ["viewAll"]})
    const auditLogs = await db.query.auditLogs.findMany({
        with: {
            fromUser: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    return <RenderedLogsPageClient logs={auditLogs} showUserLink={viewAllPerms.isAuthorised}/>
}
