export const appLogCodes = [
    "APIKEY_CREATED",
    "APIKEY_DELETED",
    "APIKEY_EDITED"
] as const
export type AppLogCode  = (typeof appLogCodes)[number]
