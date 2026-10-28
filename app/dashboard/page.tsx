import { Suspense } from "react";
import RenderedDashboardPage from "./rendered";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function DashboardPage({searchParams}:{searchParams: Promise<{view: string}>}) {
    return <Suspense>
        <RenderedDashboardPage searchParams={searchParams}/>
    </Suspense>
}