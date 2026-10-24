'use client';

import { getLogsColumns } from "@/components/tables/logs/columns";
import { LogsDataTable } from "@/components/tables/logs/data-table";
import { Application, DbLog } from "@/lib/schema/schemaTypes";
import { User } from "better-auth";

type DatabaseLog = DbLog & {
    fromUser: User | null;
    fromApp: Application | null;
};

export default function LogsPageClient({logs, showUserLink}: {logs: DatabaseLog[], showUserLink: boolean}){
    return <div className="pt-4 h-full relative min-w-0 max-w-full">
        <LogsDataTable columns={getLogsColumns({type: "db", showUserLink})} data={logs} type="db"/>
    </div>
}