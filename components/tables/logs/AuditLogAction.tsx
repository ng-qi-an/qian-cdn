'use client';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AuditLog, DbLog } from "@/lib/schema/schemaTypes";
import { availableServices } from "@/lib/services";
import { AppWindowMac, Ban, CircleQuestionMark, Database, DatabaseCog, DatabasePlus, DatabaseX, FilePen, FilePlusCorner, FileXCorner, KeyIcon, Pen, Trash, UserKey, UserPen, UserPlus, UserX } from "lucide-react";
import Link from "next/link";

export default function AuditLogAction({log}: {log: AuditLog}){
    let Icon;
    let header;
    let text;
    let status : "default" | "destructive" | "success" | "warning" = "default"
    const provider = availableServices.find((x)=> x.id == log.data.database?.provider)
    switch (log.code){
        case "APPLICATION_CREATED":
            Icon = AppWindowMac
            header = `Application created`
            text = <><Link href={`/dashboard/applications/${log.data.application.id}`} className="underline">{log.data.application.name}</Link> was created on <Link href={`/dashboard/admin/databases/${log.data.database.id}`} className="underline "><Database className="size-4 inline"/> {log.data.database.name}</Link></>
            break;
        case "APPLICATION_REVIEWED":
            Icon = AppWindowMac
            header = `Application ${log.data.approved ? "approved" : "denied"}`
            text = log.data.approved ? <><Link href={`/dashboard/applications/${log.data.application.id}`} className="underline">{log.data.application.name}</Link> by <Link href={`/dashboard/users/${log.data.application.owner?.id}`} className="underline">{log.data.application.owner?.name ?? "Unknown user"}</Link> was approved.</> : <>{log.data.application.name} by <Link href={`/dashboard/users/${log.data.application.owner?.id}`} className="underline">{log.data.application.owner?.name ?? "Unknown user"}</Link> was denied.</>
            break;
        case "APPLICATION_EDITED":
            Icon = AppWindowMac
            header = `Application updated`
            text = <><Link href={`/dashboard/applications/${log.data.application.id}`} className="underline">{log.data.application.name}</Link> was updated.</>
            break;
        case "APPLICATION_DELETED":
            Icon = AppWindowMac
            header = `Application deleted`
            status = "destructive"
            text = <>{log.data.application.name} was permanently deleted from <Link href={`/dashboard/admin/databases/${log.data.database.id}`} className="underline"><Database className="size-4 inline"/> {log.data.database.name}</Link></>
            break;
        case "DATABASE_CREATED":
            Icon = DatabasePlus
            header = `Database created`
            text = <><Link href={`/dashboard/admin/databases/${log.data.database.id}`} className="underline">{log.data.database.name}</Link> was created on {provider?.name ?? "Unknown provider"}</>
            break;
        case "DATABASE_EDITED":
            Icon = DatabaseCog
            header = `Database updated`
            text = <><Link href={`/dashboard/admin/databases/${log.data.database.id}`} className="underline">{log.data.database.name}</Link> was updated.</>
            break;
        case "DATABASE_DELETED":
            Icon = DatabaseX
            header = `Database deleted`
            status = "destructive"
            text = <>{log.data.database.name} was permanently deleted from {provider?.name ?? "Unknown provider"}</>
            break;
        case "USER_CREATED":
            Icon = UserPlus
            header = `User created`
            text = <><Link href={`/users/${log.data.user.id}`} className="underline">{log.data.user.name}</Link> was created.</>
            break;
        case "USER_EDITED":
            Icon = UserPen
            header = `User updated`
            text = <><Link href={`/users/${log.data.user.id}`} className="underline">{log.data.user.name}</Link> was updated.</>
            break;
        case "USER_PASSWORD_CHANGED":
            Icon = UserKey
            header = `User password changed`
            status = "warning"
            text = <><Link href={`/users/${log.data.user.id}`} className="underline">{log.data.user.name}</Link> had their password changed manually.</>
            break;
        case "USER_BANNED":
            Icon = Ban
            header = `User banned`
            status = "destructive"
            text = <><Link href={`/users/${log.data.user.id}`} className="underline">{log.data.user.name}</Link> was banned {log.data.expiresTimestamp ? `until ${new Date(log.data.expiresTimestamp).toLocaleString()}` : "permanently."}. Reason: {log.data.reason ?? "No reason provided."} </>
            break;
        case "USER_UNBANNED":
            Icon = Ban
            header = `User unbanned`
            status = "warning"
            text = <><Link href={`/users/${log.data.user.id}`} className="underline">{log.data.user.name}</Link> was unbanned.</>
            break;
        case "USER_DELETED":
            Icon = UserX
            header = `User deleted`
            status = "destructive"
            text = <>{log.data.user.name} was permanently deleted.</>
            break;
        default:
            Icon = CircleQuestionMark
            header = "Unknown action"
            text = "An unknown action was performed."
    }
    return <div className="flex items-center gap-3 flex-1 min-w-sm group">
        <div className={`size-10 shrink-0 flex items-center justify-center border rounded-full ${status == "destructive" ? "border-destructive/50 text-destructive bg-destructive/5" : status == "warning" ? "border-amber-700 text-amber-600 bg-amber-700/5" : ""}`}>
            <Icon className="size-4" />
        </div>
        <div>
            <p className="font-medium">{header}</p>
            <Tooltip>
                <TooltipTrigger delay={600} render={
                    <p className="text-sm text-muted-foreground text-wrap line-clamp-1 cursor-default">{text}</p>
                }/>
                <TooltipContent>
                    <p className="2">{text}</p>
                </TooltipContent>
            </Tooltip>
        </div>
    </div>
}