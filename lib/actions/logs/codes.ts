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
