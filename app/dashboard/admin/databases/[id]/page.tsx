import { Suspense } from "react";
import RenderedDbOverviewPage from "./rendered";

export default function DbPage({params}:{params: Promise<{id: string}>}){
    return <Suspense>
        <RenderedDbOverviewPage params={params}/>
    </Suspense>
}