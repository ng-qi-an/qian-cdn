import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import CreateApplicationsRendered from "./rendered";
import { Suspense } from "react";
import Link from "next/link";

export const metadata = {
    title: "Create application",
}

export default function ApplicationsPage(){
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Applications", href: "/dashboard/applications"}, {name: "Create application"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title="Create an application" beforeHeadingRender={<div className="block md:hidden"><Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href="/dashboard/applications"/>}><ChevronLeft/></Button></div>}/>
            <Suspense>
                <CreateApplicationsRendered/>
            </Suspense>
        </DashboardBody>
    </Dashboard>
}
