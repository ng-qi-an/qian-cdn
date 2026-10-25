import { db } from "@/lib/db";
import RenderedClientDbOverviewPage from "./client";

export default async function RenderedDbOverviewPage({params}: {params: Promise<{id: string}>}){
    const {id} = await params;
    const data = await db.query.databases.findFirst({
        where: {
            id
        },
        columns: {
            keys: false
        },
        with: {
            files: {
                columns: {
                    name: true,
                    size: true,
                    contentType: true,
                }
            }
        }
    })
    if (!data) return <p>Database not found</p>
    return <RenderedClientDbOverviewPage data={data}/>
}