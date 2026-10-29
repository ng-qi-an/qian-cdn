'use server';
import { AuditLogCode } from "./codes"
import { makeAuditLog } from "./makeAuditLog";


export async function makeAuditLogClient({code, data, userId}: {code: AuditLogCode, data?: Record<string, any>, userId: string}) {
    return makeAuditLog({code, data, userId});
}