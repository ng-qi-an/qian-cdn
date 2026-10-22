import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import UserPageClient from "./client";
import { db } from "@/lib/db";
import { session } from "@/lib/schema/auth-schema";
import { desc, eq } from "drizzle-orm";

export const instant = false;

export default async function UserPage({params}: {params: Promise<{id: string}>}) {
    const { id } = await params;
    const data = await auth.api.getUser({
        query: {
            id,
        },
        headers: await headers(),
    });
    const sessions = await db.select().from(session).where(eq(session.userId, id)).orderBy(desc(session.createdAt))
    return <UserPageClient user={data} sessions={sessions}/>
}