import { Suspense } from "react";
import RenderedAppOverviewPage from "./rendered";

export const instant = false;



export default function ApplicationPage({params}:{params: Promise<{id: string}>}){
    return <Suspense>
        <RenderedAppOverviewPage params={params}/>
    </Suspense>
}