import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import ClientRenderedDashboardPage from "./client";
import { db } from "@/lib/db";

export default async function RenderedDashboardPage({searchParams}: {searchParams: Promise<{view: string}>}){
    const {view} = await searchParams;
    const viewAllDatabasesPerms = await userHasPermissionServer({
        databases: ["viewAll"]
    })
    const createDatabasePerms = await userHasPermissionServer({
        databases: ["create"]
    })
    const viewAllApplicationsPerms = await userHasPermissionServer({
        applications: ["viewAll"]
    })
    const adminView = view == "admin"
    const fetchedApps = await db.query.applications.findMany({
        where: {
            ownerId: (viewAllApplicationsPerms.isAuthorised && adminView) ? {isNotNull: true} : viewAllApplicationsPerms.user.id
        },
        with: {
            appAnalytics: true,
            files: {
                columns: {
                    size: true,
                    createdAt: true
                }
            }
        }
    })
    const fetchedDbs = createDatabasePerms.isAuthorised ? (await db.query.databases.findMany({
        where: {
            ownerId: (viewAllDatabasesPerms.isAuthorised && adminView) ? {isNotNull: true} : viewAllDatabasesPerms.user.id
        },
        with: {
            files: {
                columns: {
                    size: true,
                    createdAt: true
                }
            }
        }
    })): []
    return <ClientRenderedDashboardPage adminView={adminView} isAdmin={viewAllApplicationsPerms.isAuthorised} user={viewAllApplicationsPerms.user} fetchedApps={fetchedApps} fetchedDbs={fetchedDbs} />
}