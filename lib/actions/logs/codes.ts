export const appLogCodes = [
    "APIKEY_CREATED",
    "APIKEY_DELETED"
] as const
export type AppLogCode  = (typeof appLogCodes)[number]
