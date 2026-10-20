'use client';

import { getLogsColumns } from "@/components/tables/logs/columns";
import { LogsDataTable } from "@/components/tables/logs/data-table";

export function RenderedLogsPageClient({logs, showUserLink}: {logs: any, showUserLink: boolean}){
    return <div className="h-full min-h-0 min-w-0 max-w-full">
        <LogsDataTable columns={getLogsColumns({type: "app", showUserLink, showAppOriginColumn: true})} data={logs} type="app"/>
    </div>
}