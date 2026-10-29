import { db } from "@/lib/db"
import { auditLogs } from "@/lib/schema/schema"
import { generateId } from "better-auth"
import { AuditLogCode, auditLogCodes, dbLogCodes } from "./codes"


export async function makeAuditLog({code, data, userId}: {code: AuditLogCode, data?: Record<string, any>, userId: string}) {
    if (!auditLogCodes.includes(code)) {
        throw new Error(`Invalid db log code: ${code}. Must be one of: ${dbLogCodes.join(", ")}`)
    }
    const payload: typeof auditLogs.$inferInsert = {
        id: generateId(16),
        fromUserId: userId,
        code: code,
        data: data || {},
    }
    await db.insert(auditLogs).values(payload);
    return payload
}