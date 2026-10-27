import { Suspense } from "react";
import RenderedDashboardPage from "./rendered";

export default function DashboardPage({searchParams}:{searchParams: Promise<{view: string}>}) {
    return <Suspense>
        <RenderedDashboardPage searchParams={searchParams}/>
    </Suspense>
}