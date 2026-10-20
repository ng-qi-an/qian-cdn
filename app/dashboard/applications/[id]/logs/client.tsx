'use client';

import { getLogsColumns } from "@/components/tables/logs/columns";
import { LogsDataTable } from "@/components/tables/logs/data-table";
import { apikey } from "@/lib/schema/auth-schema";
import { AppLog } from "@/lib/schema/schemaTypes";
import { User } from "better-auth";

type ApplicationLog = AppLog & {
    fromUser: User | null;
    fromApiKey: Omit<typeof apikey.$inferSelect, "key"> | null;
};

export default function LogsPageClient({logs, showUserLink}: {logs: ApplicationLog[], showUserLink: boolean}){
    return <div className="pt-4 h-full relative min-w-0 max-w-full">
        <LogsDataTable columns={getLogsColumns({type: "app", showUserLink})} data={logs} type="app"/>
    </div>
}