import { defineRelationsPart } from "drizzle-orm";
import { appAnalytics, applications, appLogs, auditLogs, databases, dbLogs, files } from "./schema";
import { apikey, user } from "./auth-schema";

export const relations = defineRelationsPart({ applications, user, files, databases, apikey, appLogs, dbLogs, auditLogs, appAnalytics }, (r) => ({
    files: {
        database: r.one.databases({
            from: r.files.databaseId,
            to: r.databases.id
        }),
        applications: r.one.applications({
            from: r.files.applicationId,
            to: r.applications.id
        })
    },
    databases: {
        owner: r.one.user({
            from: r.databases.ownerId,
            to: r.user.id,
        }),
        applications: r.many.applications(),
        files: r.many.files(),
        dbLogs: r.many.dbLogs()
    },
    applications: {
        owner: r.one.user({
            from: r.applications.ownerId,
            to: r.user.id,
        }),
        database: r.one.databases({
            from: r.applications.databaseId,
            to: r.databases.id
        }),
        files: r.many.files(),
        appLogs: r.many.appLogs(),
        dbLogs: r.many.dbLogs(),
        appAnalytics: r.many.appAnalytics(),
    },
    user: {
        applications: r.many.applications(),
        databases: r.many.databases(),
        appLogs: r.many.appLogs(),
        dbLogs: r.many.dbLogs(),
        auditLogs: r.many.auditLogs(),
    },
    apikey: {
        appLogs: r.many.appLogs(),
    },
    appLogs: {
        fromApiKey: r.one.apikey({
            from: r.appLogs.fromApiKeyId,
            to: r.apikey.id
        }),
        fromUser: r.one.user({
            from: r.appLogs.fromUserId,
            to: r.user.id
        }),
        application: r.one.applications({
            from: r.appLogs.applicationId,
            to: r.applications.id
        })
    },
    dbLogs: {
        database: r.one.databases({
            from: r.dbLogs.databaseId,
            to: r.databases.id
        }),
        fromUser: r.one.user({
            from: r.dbLogs.fromUserId,
            to: r.user.id
        }),
        fromApp: r.one.applications({
            from: r.dbLogs.fromAppId,
            to: r.applications.id
        }),
    },
    auditLogs: {
        fromUser: r.one.user({
            from: r.auditLogs.fromUserId,
            to: r.user.id
        }),
    },
    appAnalytics: {
        application: r.one.applications({
            from: r.appAnalytics.applicationId,
            to: r.applications.id
        })
    }
}))