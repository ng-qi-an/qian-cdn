import { db } from "@/lib/db"
import { dbLogs } from "@/lib/schema/schema"
import { generateId } from "better-auth"
import { runAfterResponse } from "@/lib/runAfterResponse"
import { DbLogCode, dbLogCodes } from "./codes"


export async function makeDbLog({dbId, code, data, userId, appId}: {dbId: string, code: DbLogCode, data?: Record<string, any>, userId?: string, appId?: string}) {
    if (!userId && !appId) {
        throw new Error("Either userId or appId must be provided.")
    }
    if (!dbLogCodes.includes(code)) {
        throw new Error(`Invalid db log code: ${code}. Must be one of: ${dbLogCodes.join(", ")}`)
    }
    const payload: typeof dbLogs.$inferInsert = {
        id: generateId(16),
        databaseId: dbId,
        fromUserId: userId,
        fromAppId: appId,
        code: code,
        data: data || {},
    }
    // Runs after the response is sent so logging doesn't block the caller
    runAfterResponse(async () => {
        try {
            await db.insert(dbLogs).values(payload);
        } catch (error) {
            console.error("Error writing db log:", error);
        }
    });
    return payload
}