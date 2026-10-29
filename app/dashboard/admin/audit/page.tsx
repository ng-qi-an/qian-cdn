import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Suspense } from "react";
import RenderedLogsPage from "./rendered";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Audit',
};

export default function LogsPage() {
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Audit", href: "/dashboard/admin/audit"}]} />
        <DashboardBody>
            <DashboardSectionHeader title="Audit" description="View actions performed across the platform." />
            <Suspense>
                <RenderedLogsPage/>
            </Suspense>
        </DashboardBody>
    </Dashboard>
}