import { getLogsColumns } from "@/components/tables/logs/columns";
import { LogsDataTable } from "@/components/tables/logs/data-table";
import { db } from "@/lib/db";
import { Suspense } from "react";
import LogsPageClient from "./client";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";

export const metaadata = {
    title: 'Logs',
};

export default async function ApplicationLogs({params}: {params: Promise<{id: string}>}){
    return <Suspense>
        <ApplicationLogsRender params={params} />
    </Suspense>
}

async function ApplicationLogsRender({params}: {params: Promise<{id: string}>}){
    const {id} = await params
    const viewAllPerms = await userHasPermissionServer({databases: ["viewAll"]})
    const logs = await db.query.dbLogs.findMany({
        where: {
            databaseId: id
        },
        with: {
            fromApp: true,
            fromUser: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    return <LogsPageClient logs={logs} showUserLink={viewAllPerms.isAuthorised}/>
}