export const appLogCodes = [
    "APIKEY_CREATED",
    "APIKEY_DELETED",
    "APIKEY_EDITED",
    "FILE_CREATED",
    "FILE_DELETED",
    "FILE_EDITED",
    "APPLICATION_EDITED"
] as const
export type AppLogCode  = (typeof appLogCodes)[number]

export const dbLogCodes = [
    "FILE_CREATED",
    "FILE_DELETED",
    "FILE_EDITED",
    "DATABASE_EDITED"
] as const
export type DbLogCode  = (typeof dbLogCodes)[number]

export const auditLogCodes = [
    "APPLICATION_CREATED",
    "APPLICATION_REVIEWED",
    "APPLICATION_DELETED",
    "APPLICATION_EDITED",
    "DATABASE_CREATED",
    "DATABASE_DELETED",
    "DATABASE_EDITED",
    "USER_CREATED",
    "USER_EDITED",
    "USER_PASSWORD_CHANGED",
    "USER_UNBANNED",
    "USER_BANNED",
    "USER_DELETED"
] as const
export type AuditLogCode  = (typeof auditLogCodes)[number]