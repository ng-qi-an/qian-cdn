import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import RenderedUsers from "./rendered";

export default function UsersPage(){
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Users", href: "/dashboard/admin/users"}]}/>
        <DashboardBody>
            <DashboardSectionHeader title="Users" description="Manage users of your application." actionRender={<Link href="/dashboard/admin/users/create">
                <Button>
                    <Plus/> Create User
                </Button>
            </Link>}/>
            <Suspense>
                <RenderedUsers/>
            </Suspense>
        </DashboardBody>
    </Dashboard>
}