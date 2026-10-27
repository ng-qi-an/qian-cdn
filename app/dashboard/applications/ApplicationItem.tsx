import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Application } from "@/lib/schema/schemaTypes";
import { availableServices } from "@/lib/services";
import { AppWindowMac, ChevronRight, Ellipsis, Logs, Settings, Trash, User, UserSearch } from "lucide-react";
import Link from "next/link";
import UsageBar from "@/components/UsageBar";
import { Label } from "@/components/ui/label";
import ApproveDenyButtons from "./ApproveDenyButtons";

export default function ApplicationItem({app, index, layout, length, showUserAndDB}: {app: Application & {files: {size: number}[], owner: {name: string} | null, database: {id: string, name: string, provider: string} | null}, index: number, layout: string, length: number, showUserAndDB: boolean}){
    const provider = availableServices.find((service) => service.id == app.database?.provider);
    
    return <div className={`border ${app.status == "requested" ? `${layout == 'list' ? 'bg-card dark:border-l-transparent dark:border-r-transparent dark:border-b-transparent' : 'bg-background'}` : "dark:bg-card dark:border-l-transparent dark:border-r-transparent dark:border-b-transparent"} flex ${layout == 'list' ? `${index == length -1 ? `border-b-border dark:border-b-transparent` : `border-b-transparent`} ${index == 0 && 'dark:border-t-transparent'} items-center` : `flex-col ${app.status != 'requested' ? 'dark:border-none' : "border-dashed"}`} p-4 w-full cursor-default`}>
        <div className="flex flex-1 items-center order-1">
            <div className={`${layout == "list" ? "size-10" : "size-14"} shrink-0 flex items-center justify-center bg-secondary rounded-full`}>
                {provider ? <AppWindowMac className={layout == 'list' ? "size-4" : "size-6"}/> : <></>}
            </div>
            <div className={`${layout == 'list' ? 'ml-4' : 'ml-2'} w-full`}>
                <Link href={`/dashboard/applications/${app.id}`} className={`group w-full`}>
                    <p className={`font-medium ${layout == 'list' ? 'text-sm' : 'text-base'} w-full group-hover:underline flex items-center gap-2`}>
                        {app.name}
                    </p>
                </Link>
                {app.status == "requested" && showUserAndDB ? 
                    <p className="text-sm text-muted-foreground">This app needs approval from you.</p>
                : <Link href={showUserAndDB ? `/dashboard/admin/databases/${app.database?.id}` : "#"} className={`group w-full ${showUserAndDB ? 'hover:underline text-muted-foreground' : 'cursor-default text-muted-foreground'}`}>
                    <p className="text-sm line-clamp-1">{app.database?.name ?? "Unknown database"}</p>
                </Link>}
            </div> 
        </div>
        {layout != "list" && showUserAndDB && app.status == "requested" ?
            <div className="flex flex-col mt-4 gap-1 order-3">
                <Label>Description:</Label>
                <p className="text-muted-foreground text-sm">{app.description}</p>
            </div>
        : 
        <div className={`${layout == 'list' ? "order-2 hidden lg:block mx-2 lg:flex-1 lg:max-w-[25%]" : "order-3 w-full mt-4"}`}>
            <div className={`w-full ${layout == 'list' && "max-w-45"}`}><UsageBar files={app.files || []} limit={app.limit || 0} alerts={app.alerts}/></div>
        </div>}
        <div className={`${layout == 'list' ? "order-3 mx-2 lg:flex-1 lg:max-w-[25%]" : "hidden"}`}>
            <p className="text-sm text-muted-foreground flex items-center gap-1"><User className="size-4 "/><span className="hidden lg:inline">Owned by </span><Link href={`/dashboard/admin/users/${app.ownerId}`} className="hover:underline hover:text-foreground">{app.owner?.name ?? "Unknown user"}</Link></p>
        </div>
        <div className={`order-4 flex items-center justify-end ${layout == "list" ? "ml-4 " : "mt-4"}`}>
            <Link href={showUserAndDB ? `/dashboard/admin/users/${app.ownerId}` : "#"} className={layout == 'list' ? 'hidden' : `w-full ${showUserAndDB ? 'hover:underline hover:text-foreground' : 'cursor-default'}`}>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><User className="size-4"/><span className="line-clamp-1 break-all">{app.owner?.name ?? "Unknown user"}</span></p>
            </Link>
            {app.status == 'requested' && showUserAndDB ? <ApproveDenyButtons appId={app.id}/> : <>
            <div className="hidden sm:block mr-1">
                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button size="icon-sm" variant="ghost">
                            <Ellipsis/>
                        </Button>}
                    />
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>More actions</DropdownMenuLabel>
                            <DropdownMenuItem render={<Link href={`/dashboard/applications/${app.id}/logs`}/>}><Logs/> View Logs</DropdownMenuItem>
                            {showUserAndDB && <DropdownMenuItem render={<Link href={`/dashboard/admin/users/${app.ownerId}`}/>}><UserSearch/> View Owner</DropdownMenuItem>}
                            <DropdownMenuItem render={<Link href={`/dashboard/applications/${app.id}/settings`}/>}><Settings/> Configure</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem render={<Link href={`/dashboard/applications/${app.id}/settings#danger-zone`}/>} variant="destructive"><Trash/> Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Button size="sm" variant="secondary" className={"bg-secondary"} nativeButton={false} render={<Link href={`/dashboard/applications/${app.id}`}/>}>View <ChevronRight/></Button>
            </>}
        </div>
    </div>
}