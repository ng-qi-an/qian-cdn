"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "../features"
import { AppLog } from "@/lib/schema/schemaTypes"
import SortedColumnHeader from "../SortedColumnHeader"
import { User } from "better-auth"
import { ApiKey } from "@better-auth/api-key"
import AppLogAction from "./AppLogAction"
import Link from "next/link"
import { UserRound } from "lucide-react"


// Use `accessor` for data columns and `display` for columns without one.



export const getLogsColumns = (type: "app", showUserLink: boolean)=>{
    let columnHelper;
    let extraColumns: any[] = []
    if (type === "app") {
        columnHelper = createColumnHelper<DataTableFeatures, AppLog & {fromUser: User, fromApiKey: ApiKey}>()
        extraColumns = [
            columnHelper.accessor("code", {
                header: ({table})=> <p className="flex items-center gap-1">Action</p>,
                cell: ({row}) => {
                    const log = row.original
                    return <AppLogAction log={log}/>
                }
            }),
            columnHelper.display({
                id: "subject",
                header: ({table})=> <p className="flex items-center gap-1">Action by</p>,
                cell: ({row})=>{
                    const log = row.original
                    if (log.fromUserId) {
                        return <Link href={`/dashboard/admin/users/${log.fromUserId}`} className={`hover:underline ${!showUserLink && 'pointer-events-none'}`} title="View user details"><p className="flex items-center gap-1"><UserRound className="size-4"/> {log.fromUser.name}</p></Link>
                    } else if (log.fromApiKeyId) {
                        return log.fromApiKey.name
                    }
                }
            })
        ]
    } else {
        throw new Error("Choose a correct type")
    }
    const columns = [...extraColumns, columnHelper.accessor("createdAt", {
            header: ({column}) => <SortedColumnHeader column={column}>Created at</SortedColumnHeader>,
            cell: ({row}) => {
                const createdAt = new Date(row.original.createdAt)
                return createdAt.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})
            }
        }),
    ]
    return columnHelper.columns(columns)
}