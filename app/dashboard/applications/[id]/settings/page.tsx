import { db } from "@/lib/db";
import AppSettingsRendered from "./rendered";
import { redirect } from "next/navigation";
import { applications } from "@/lib/schema/schema";

export const instant = false;

export default async function ApplicationSettings({params}:{params: Promise<{id: string}>}){
    const { id } = await params;
    const appData = await db.query.applications.findFirst({
        where: { id },
        with: {
            database: {
                columns: {
                    keys: false,
                },
                with: {
                    owner: {
                        columns: {
                            id: true,
                            name: true
                        },
                    },
                    files: {
                        columns: {
                            size: true
                        }
                    }
                }
            }
        }
    })
    const otherApps = await db.select({name: applications.name, id: applications.id}).from(applications)
    return <AppSettingsRendered appData={appData!} otherApps={otherApps}/>
}