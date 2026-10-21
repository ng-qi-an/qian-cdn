'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Key, LayoutGrid, Logs, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function UserTabs({userId}: {userId: string}){
    const pathname = usePathname();
    const router = useRouter();
    const normalisedPathname = pathname.split("/")[pathname.split("/").length - 1]
    return <div className="border-b overflow-auto scroll-fade-x scrollbar-none w-full shrink-0">
            <Tabs value={normalisedPathname} defaultValue={userId} onValueChange={(value) => {
            router.push(`/dashboard/admin/users/${userId}/${value == userId ? "" : value}`);
        }}> 
            <TabsList variant="line" className="min-w-140 w-full">
                <TabsTrigger value={userId}><LayoutGrid/> Overview</TabsTrigger>
                <TabsTrigger value="files"><FolderOpen/>Files</TabsTrigger>
                <TabsTrigger value="api-keys"><Key />Owned</TabsTrigger>
                <TabsTrigger value="logs"><Logs/>Logs</TabsTrigger>
            </TabsList>
        </Tabs>
    </div>
}