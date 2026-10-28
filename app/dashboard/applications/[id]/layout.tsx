import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { redirect } from "next/navigation";
import AppSwitcher from "./AppSwitcher";
import ApplicationTabs from "./ApplicationTabs";
import { Button } from "@/components/ui/button";
import { AppWindowMac, Ellipsis } from "lucide-react";
import { availableServices } from "@/lib/services";
import { Metadata } from "next";

export const instant = false;

export async function generateMetadata({params}: {params: Promise<{id: string}>}): Promise<Metadata> {
    const { id } = await params;
    const data = await db.query.applications.findFirst({
        where: {
            id
        },
        columns: {
            name: true
        }
    })
    return {
        title: {
            template: `%s - ${data?.name ?? "Application"} | UnifiedCDN`,
            default: "Overview - " + (data?.name ?? "Application") + " | UnifiedCDN",
        },
    }
}

export default async function ApplicationPage({params, children}: {params: Promise<{id: string}>, children: React.ReactNode}){
    const { id } = await params;
    const viewAllPerms = await userHasPermissionServer({applications: ["viewAll"]});
    const appData = await db.query.applications.findFirst({
        where: {
            id,
            ownerId: viewAllPerms.isAuthorised ? {isNotNull: true} : viewAllPerms.user.id
        },
        with: {
            database: {
                columns: {
                    provider: true,
                    name: true
                }
            }
        }
    })
    if (!appData) return redirect("/dashboard/applications");
    
    const otherApps = await db.query.applications.findMany({
        where: {
            ownerId: viewAllPerms.isAuthorised ? {isNotNull: true} : viewAllPerms.user.id
        },
        columns: {
            id: true,
            name: true
        }
    })
    const transformedOtherApps = otherApps.map((app)=> ({label: app.name, value: app.id}))
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Applications", href: "/dashboard/applications"}, {component: <div className="flex items-center">
            <AppSwitcher otherApps={transformedOtherApps} appId={appData.id} appName={appData.name}/>
        </div>}]}/>
        <DashboardBody>
            <DashboardSectionHeader title={`${appData.name}`} description={appData.database?.name} beforeHeadingRender={<ProviderIcon provider={appData.database?.provider}/>} actionRender={<Button size="icon-sm" variant="ghost"><Ellipsis/></Button>} />
            <ApplicationTabs appId={appData.id}/>
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
    return <div className="size-14 mr-2 flex items-center justify-center bg-card rounded-full"><AppWindowMac className="size-6"/></div>
}