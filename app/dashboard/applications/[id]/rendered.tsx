import { db } from "@/lib/db";
import RenderedClientAppOverviewPage from "./client";

export default async function RenderedAppOverviewPage({params}: {params: Promise<{id: string}>}){
    const {id} = await params;
    const data = await db.query.applications.findFirst({
        where: {
            id
        },
        with: {
            files: {
                columns: {
                    name: true,
                    size: true,
                    contentType: true,
                }
            },
            owner: {
                columns: {
                    name: true,
                    id: true
                }
            },
            appAnalytics: true,
            database: {
                columns: {
                    id: true,
                    name: true,
                    provider: true
                }
            }
        }
    })
    if (!data) return <p>App not found</p>
    return <RenderedClientAppOverviewPage data={data}/>
}