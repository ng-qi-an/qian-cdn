'use client';
import { AppLog } from "@/lib/schema/schemaTypes";
import { CircleQuestionMark, KeyIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AppLogAction({log}: {log: AppLog}){
    const {id} = useParams();
    let Icon;
    let header;
    let text;
    let status : "default" | "error" | "success" | "warning" = "default"
    switch (log.code){
        case "APIKEY_CREATED":
            Icon = KeyIcon
            header = "API Key created"
            text = <>A new API key, <Link title="View api key details" href={`/dashboard/applications/${id}/api-keys`} className="underline hover:text-foreground">{log.data.apiKeyName}</Link> was created.</>
            break;
        case "APIKEY_DELETED":
            Icon = KeyIcon
            header = "API Key deleted"
            status = "error"
            text = `An API key, ${log.data.apiKeyName} was permanently deleted.`
            break;
        default:
            Icon = CircleQuestionMark
            header = "Unknown action"
            text = "An unknown action was performed."

    }
    return <div className="flex items-center gap-3">
        <div className="size-10 shrink-0 flex items-center justify-center border rounded-full">
            <Icon className="size-4" />
        </div>
        <div>
            <p className="font-medium">{header}</p>
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    </div>
}