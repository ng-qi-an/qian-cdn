import { db } from "@/lib/db"
import { appLogs } from "@/lib/schema/schema"
import { generateId } from "better-auth"
import { AppLogCode, appLogCodes } from "./codes"


export async function makeAppLog({appId, code, data, userId, apiKeyId}: {appId: string, code: AppLogCode, data?: Record<string, any>, userId?: string, apiKeyId?: string}) {
    if (!userId && !apiKeyId) {
        throw new Error("Either userId or apiKeyId must be provided.")
    }
    if (!appLogCodes.includes(code)) {
        throw new Error(`Invalid app log code: ${code}. Must be one of: ${appLogCodes.join(", ")}`)
    }
    const payload: typeof appLogs.$inferInsert = {
        id: generateId(16),
        applicationId: appId,
        fromUserId: userId,
        fromApiKeyId: apiKeyId,
        code: code,
        data: data || {},
        createdAt: new Date()
    }
    await db.insert(appLogs).values(payload);
    return payload
}