'use client';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DbLog } from "@/lib/schema/schemaTypes";
import { CircleQuestionMark, FilePen, FilePlusCorner, FileXCorner, KeyIcon, Pen, Trash } from "lucide-react";
import Link from "next/link";

export default function DbLogAction({log}: {log: DbLog}){
    let Icon;
    let header;
    let text;
    let status : "default" | "destructive" | "success" | "warning" = "default"
    switch (log.code){
        case "FILE_CREATED":
            Icon = FilePlusCorner
            header = `File${log.data.files.length > 1 ? "s" : ""} uploaded`
            text = <>{log.data.files.length} file{log.data.files.length > 1 ? "s were" : ' was'} uploaded to the database.</>
            break;
        case "FILE_EDITED":
            Icon = FilePen
            header = `File updated`
            text = <>"{log.data.oldName}" was renamed to "{log.data.newName}".</>
            break;
        case "FILE_DELETED":
            Icon = FileXCorner
            header = `File${log.data.files.length > 1 ? "s" : ""} deleted`
            text = <>{log.data.files.length} file{log.data.files.length > 1 ? "s were" : " was"} deleted from the database.</>
            status = "destructive"
            break;
        case "DATABASE_EDITED":
            Icon = Pen
            header = `Database updated`
            text = <>The database configurations were updated. Verify if they are still accurate.</>
            break;
        default:
            Icon = CircleQuestionMark
            header = "Unknown action"
            text = "An unknown action was performed."

    }
    return <div className="flex items-center gap-3 flex-1 min-w-sm group">
        <div className={`size-10 shrink-0 flex items-center justify-center border rounded-full ${status == "destructive" ? "border-destructive/50 text-destructive bg-destructive/5" : ""}`}>
            <Icon className="size-4" />
        </div>
        <div>
            <p className="font-medium">{header}</p>
            <Tooltip>
                <TooltipTrigger delay={600} render={
                    <p className="text-sm text-muted-foreground text-wrap line-clamp-1 cursor-default">{text}</p>
                }/>
                <TooltipContent>
                    <p>{text}</p>
                </TooltipContent>
            </Tooltip>
        </div>
    </div>
}