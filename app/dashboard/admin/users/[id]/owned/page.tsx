import { Suspense } from "react";
import RenderedUserOwnedPage from "./rendered";

export const metadata = {
    title: 'Owned',
};

export default function UserOwnedPage({params, searchParams}: {params: Promise<{id: string}>, searchParams: Promise<{layout?: string | undefined}>}) {
    return <Suspense>
        <RenderedUserOwnedPage params={params} searchParams={searchParams}/>
    </Suspense>
}