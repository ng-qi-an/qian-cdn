import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DatabasesRendered from "./rendered";
import { Suspense } from "react";
import Link from "next/link";
import DashboardViewLayoutSwitch from "@/components/navigation/DashboardViewLayoutSwitch";

export const metadata = {
    title: "Databases",
}

export default function ApplicationsPage({searchParams}: {searchParams: Promise<{layout?: string | undefined}>}){
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Databases"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title="Databases" description="View your databases and their configurations." actionRender={<>
                <DashboardViewLayoutSwitch/>
                <div className="flex-1 sm:hidden"/>
                <Button size="sm" className="h-10" nativeButton={false} render={<Link href="/dashboard/admin/databases/create"/>}><Plus/><span>Create</span><span className="md:block hidden">New</span></Button>
            </>}/>
            <Suspense>
                <DatabasesRendered searchParams={searchParams}/>
            </Suspense>
        </DashboardBody>
    </Dashboard>
}