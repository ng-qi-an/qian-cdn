import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import CreateDatabasesRendered from "./rendered";
import { Suspense } from "react";
import Link from "next/link";

export const metadata = {
    title: "Create database",
}

export default function ApplicationsPage(){
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Databases", href: "/dashboard/admin/databases"}, {name: "Create database"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title="Create a database" beforeHeadingRender={<div className="block md:hidden"><Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href="/dashboard/admin/databases"/>}><ChevronLeft/></Button></div>}/>
            <Suspense>
                <CreateDatabasesRendered/>
            </Suspense>
        </DashboardBody>
    </Dashboard>
}
