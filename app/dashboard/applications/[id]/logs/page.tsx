import { getLogsColumns } from "@/components/tables/logs/columns";
import { LogsDataTable } from "@/components/tables/logs/data-table";
import { db } from "@/lib/db";
import { Suspense } from "react";
import LogsPageClient from "./client";

export default async function ApplicationLogs({params}: {params: Promise<{id: string}>}){
    return <Suspense>
        <ApplicationLogsRender params={params} />
    </Suspense>
}

async function ApplicationLogsRender({params}: {params: Promise<{id: string}>}){
    const {id} = await params
    const logs = await db.query.appLogs.findMany({
        where: {
            applicationId: id
        },
        with: {
            fromApiKey: true,
            fromUser: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    return <LogsPageClient logs={logs}/>
}