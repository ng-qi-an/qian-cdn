import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { redirect } from "next/navigation";
import DatabaseSwitcher from "./DatabaseSwitcher";
import DatabaseTabs from "./DatabaseTabs";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import { availableServices } from "@/lib/services";

export const instant = false;

export default async function DatabasePage({params, children}: {params: Promise<{id: string}>, children: React.ReactNode}){
    const { id } = await params;
    const viewAllPerms = await userHasPermissionServer({databases: ["viewAll"]});
    const dbData = await db.query.databases.findFirst({
        where: {
            id,
            ownerId: viewAllPerms.isAuthorised ? {isNotNull: true} : viewAllPerms.user.id
        },
        with: {
        }
    })
    if (!dbData) return redirect("/dashboard/admin/databases");
    
    const otherDbs = await db.query.databases.findMany({
        where: {
            ownerId: viewAllPerms.isAuthorised ? {isNotNull: true} : viewAllPerms.user.id
        },
        columns: {
            id: true,
            name: true
        }
    })
    const transformedOtherDbs = otherDbs.map((db)=> ({label: db.name, value: db.id}))
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Databases", href: "/dashboard/admin/databases"}, {component: <div className="flex items-center">
            <DatabaseSwitcher otherDbs={transformedOtherDbs} dbId={dbData.id} dbName={dbData.name}/>
        </div>}]}/>
        <DashboardBody>
            <DashboardSectionHeader title={`${dbData.name}`} description={availableServices.find((x)=> x.id == dbData.provider)?.name ?? "Unknown provider"} beforeHeadingRender={<ProviderIcon provider={dbData.provider}/>} />
            <DatabaseTabs dbId={dbData.id}/>
            <div className="h-full overflow-hidden">
                {children}
            </div>
        </DashboardBody>
    </Dashboard>
}

const ProviderIcon = ({provider}: {provider?: string}) => {
    const service = availableServices.find((service) => service.id == provider);
    if (!service) return null;
    const Icon = service.icon;
    return <div className="size-14 mr-2 flex items-center justify-center bg-card rounded-full"><Icon className="size-6"/></div>
}