import { db } from "@/lib/db";
import AppSettingsRendered from "./rendered";
import { databases } from "@/lib/schema/schema";
import { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
    title: 'Settings',
};

export default async function DbSettings({params}:{params: Promise<{id: string}>}){
    const { id } = await params;
    const dbData = await db.query.databases.findFirst({
        where: { id },
        with: {
            files: {
                columns: {
                    size: true
                }
            }
        }
    })
    const otherDbs = await db.select({name: databases.name, id: databases.id}).from(databases)
    return <AppSettingsRendered dbData={dbData!} otherDbs={otherDbs}/>
}