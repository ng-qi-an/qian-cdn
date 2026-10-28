import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import KeysList from "./KeysList";
import { db } from "@/lib/db";
import { apikey } from "@/lib/schema/auth-schema";

export const metadata = {
    title: 'API Keys',
};


export const instant = false;

export default async function APIKeysApplication({params}: {params: Promise<{id: string}>}){
    const {id: appId} = await params;
    const {apiKeys} = await auth.api.listApiKeys({
        headers: await headers()
    })
    const filteredKeys = apiKeys.filter((key)=> key.metadata?.appId === appId);
    const appData = await db.query.applications.findFirst({
        where: {
            id: appId
        },
        columns: {
            status: true
        },
    })
    return <div className="pt-4">
        <KeysList appId={appId} disableCreate={appData!.status != "active"} apiKeys={filteredKeys as unknown as Omit<typeof apikey.$inferSelect, "key">[]}/>
    </div>
}