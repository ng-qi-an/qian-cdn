'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Key, LayoutGrid, Logs, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function DatabaseTabs({dbId}: {dbId: string}){
    const pathname = usePathname();
    const router = useRouter();
    const normalisedPathname = pathname.split("/")[pathname.split("/").length - 1]
    return <div className="border-b overflow-auto scroll-fade-x scrollbar-none w-full shrink-0">
            <Tabs value={normalisedPathname} defaultValue={dbId} onValueChange={(value) => {
            router.push(`/dashboard/admin/databases/${dbId}/${value == dbId ? "" : value}`);
        }}> 
            <TabsList variant="line" className="mt-4 min-w-140 w-full">
                <TabsTrigger value={dbId}><LayoutGrid/> Overview</TabsTrigger>
                <TabsTrigger value="files"><FolderOpen/>Files</TabsTrigger>
                <TabsTrigger value="logs"><Logs/>Logs</TabsTrigger>
                <TabsTrigger value="settings"><Settings/>Settings</TabsTrigger>
            </TabsList>
        </Tabs>
    </div>
}