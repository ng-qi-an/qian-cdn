"use client"

import { ColumnHelper, createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "../features"
import { Application, AppLog, AuditLog, DbLog } from "@/lib/schema/schemaTypes"
import SortedColumnHeader from "../SortedColumnHeader"
import { User } from "better-auth"
import { ApiKey } from "@better-auth/api-key"
import AppLogAction from "./AppLogAction"
import Link from "next/link"
import { AppWindowMac, Key, UserRound } from "lucide-react"
import { availableServices } from "@/lib/services"
import DbLogAction from "./DbLogAction"
import AuditLogAction from "./AuditLogAction"


// Use `accessor` for data columns and `display` for columns without one.

export const getLogsColumns = ({type, showUserLink, showAppOriginColumn}: {type: "app" | "db" | "audit", showUserLink: boolean, showAppOriginColumn?: boolean})=>{
    let columnHelper;
    let extraColumns: any[] = []
    if (type === "app") {
        columnHelper = createColumnHelper<DataTableFeatures, AppLog & {fromUser: User, fromApiKey: ApiKey, application?: {name: string, id: string, database: {provider: string} | null} | null}>()
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
                        return <Link href={`/dashboard/admin/users/${log.fromUserId}`} className={`hover:underline ${!showUserLink && 'pointer-events-none'}`} title="View user details"><p className="flex items-center gap-2"><UserRound className="size-4"/> {log.fromUser ? log.fromUser.name : "Unknown user"}</p></Link>
                    } else if (log.fromApiKeyId) {
                        return <Link href={`/dashboard/applications/${log.applicationId}/api-keys`} className={`hover:underline`} title="View API keys"><p className="flex items-center gap-2"><Key className="size-4"/> {log.fromApiKey ? log.fromApiKey.name : "Unknown API Key"}</p></Link>
                    }
                }
            }),
        ]
        if (showAppOriginColumn) {
            extraColumns.push(columnHelper.accessor("applicationId", {
                header: ({table})=> <p className="flex items-center gap-1">Application</p>,
                cell: ({row}) => {
                    const log = row.original
                    const provider = availableServices.find(s => s.id === log.application?.database?.provider)
                    return <Link href={`/dashboard/applications/${log.applicationId}`} className={`hover:underline flex items-center gap-2`} title="View application details">{provider && <provider.icon className="size-4"/>}<p className="flex items-center gap-2">{log.application ? log.application.name : "Unknown app"}</p></Link>
                }
            }))
        }
    } else if (type == "db") {
        columnHelper = createColumnHelper<DataTableFeatures, DbLog & {fromUser: User, fromApp: Application}>()
        extraColumns = [
            columnHelper.accessor("code", {
                header: ({table})=> <p className="flex items-center gap-1">Action</p>,
                cell: ({row}) => {
                    const log = row.original
                    return <DbLogAction log={log}/>
                }
            }),
            columnHelper.display({
                id: "subject",
                header: ({table})=> <p className="flex items-center gap-1">Action by</p>,
                cell: ({row})=>{
                    const log = row.original
                    if (log.fromUserId) {
                        return <Link href={`/dashboard/admin/users/${log.fromUserId}`} className={`hover:underline ${!showUserLink && 'pointer-events-none'}`} title="View user details"><p className="flex items-center gap-2"><UserRound className="size-4"/> {log.fromUser ? log.fromUser.name : "Unknown user"}</p></Link>
                    } else {
                        return <Link href={`/dashboard/applications/${log.fromAppId}`} className={`hover:underline`} title="View application details"><p className="flex items-center gap-2"><AppWindowMac className="size-4"/> {log.fromApp ? log.fromApp.name : "Unknown app"}</p></Link>
                    }
                }
            }),
            columnHelper.accessor("fromAppId", {
                header: ({table})=> <p className="flex items-center gap-1">Application</p>,
                cell: ({row})=>{
                    const log = row.original
                    if (log.fromAppId) {
                        return <Link href={`/dashboard/applications/${log.fromAppId}`} className={`hover:underline`} title="View API keys"><p className="flex items-center gap-2"><AppWindowMac className="size-4"/> {log.fromApp ? log.fromApp.name : "Unknown app"}</p></Link>
                    } else {
                        return <p className="text-muted-foreground">N/A</p>
                    }
                }
            }),
        ]
    } else if (type == "audit") {
        columnHelper = createColumnHelper<DataTableFeatures, AuditLog & {fromUser: User | null}>()
        extraColumns = [
            columnHelper.accessor("code", {
                header: ({table})=> <p className="flex items-center gap-1">Action</p>,
                cell: ({row}) => {
                    const log = row.original
                    return <AuditLogAction log={log}/>
                }
            }),
            columnHelper.display({
                id: "subject",
                header: ({table})=> <p className="flex items-center gap-1">Action by</p>,
                cell: ({row})=>{
                    const log = row.original
                    if (log.fromUser) {
                        return <Link href={`/dashboard/admin/users/${log.fromUserId}`} className={`hover:underline ${!showUserLink && 'pointer-events-none'}`} title="View user details"><p className="flex items-center gap-2"><UserRound className="size-4"/> {log.fromUser.name}</p></Link>
                    } else {
                        return <p className="text-muted-foreground">Unknown user</p>
                    }
                }
            }),
        ]
    } else {
        throw new Error("Choose a correct type")
    }
    const columns = [...extraColumns, (columnHelper as ColumnHelper<DataTableFeatures, any>).accessor("createdAt", {
            header: ({column}) => <SortedColumnHeader column={column}>Created at</SortedColumnHeader>,
            cell: ({row}) => {
                const createdAt = new Date(row.original.createdAt)
                return createdAt.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})
            }
        }),
    ]
    return (columnHelper as ColumnHelper<DataTableFeatures, any>).columns(columns)
}