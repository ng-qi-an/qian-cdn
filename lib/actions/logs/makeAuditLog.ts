import { db } from "@/lib/db"
import { auditLogs } from "@/lib/schema/schema"
import { generateId } from "better-auth"
import { runAfterResponse } from "@/lib/runAfterResponse"
import { AuditLogCode, auditLogCodes } from "./codes"


export async function makeAuditLog({code, data, userId}: {code: AuditLogCode, data?: Record<string, any>, userId: string}) {
    if (!auditLogCodes.includes(code)) {
        throw new Error(`Invalid audit log code: ${code}. Must be one of: ${auditLogCodes.join(", ")}`)
    }
    const payload: typeof auditLogs.$inferInsert = {
        id: generateId(16),
        fromUserId: userId,
        code: code,
        data: data || {},
    }
    // Runs after the response is sent so logging doesn't block the caller
    runAfterResponse(async () => {
        try {
            await db.insert(auditLogs).values(payload);
        } catch (error) {
            console.error("Error writing audit log:", error);
        }
    });
    return payload
}