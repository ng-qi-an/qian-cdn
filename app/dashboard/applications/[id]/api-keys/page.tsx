import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import KeysList from "./KeysList";
import { db } from "@/lib/db";

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
    return <KeysList appId={appId} disableCreate={appData!.status != "active"} apiKeys={filteredKeys}/>
}