import { integer, timestamp, jsonb, numeric, pgTable, text, date, unique } from "drizzle-orm/pg-core";
import { apikey, user } from "./auth-schema";
import type { AppLogCode, DbLogCode } from "../actions/logs/codes";
import { AnalyticsEventType } from "../actions/analytics/eventTypes";

export const databases = pgTable("databases", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    ownerId: text("owner_id").notNull(),
    visibility: text("visibility").notNull(),
    provider: text("provider").notNull(),
    keys: jsonb("keys").$type<Record<string, string>>().notNull(),
    limit: numeric("limit", { mode: 'number' }).notNull(),
    alerts: jsonb("alerts").$type<any[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull().default("No description provided."),
    ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    databaseId: text("database_id").notNull().references(() => databases.id, { onDelete: "cascade" }),
    limit: numeric("limit", { mode: 'number' }).notNull(),
    status: text("status").notNull(),
    alerts: jsonb("alerts").$type<any[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const files = pgTable("files", {
    id: text("id").primaryKey(),
    applicationId: text("application_id").notNull(),
    databaseId: text("database_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    contentType: text("content_type").notNull(),
    size: numeric("size", { mode: 'number' }).notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const appLogs = pgTable("app_logs", {
    id: text("id").primaryKey(),
    applicationId: text("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
    fromUserId: text("from_user_id").references(() => user.id, { onDelete: "no action" }),
    fromApiKeyId: text("from_api_key_id").references(() => apikey.id, { onDelete: "no action" }),
    code: text("type").$type<AppLogCode>().notNull(),
    data: jsonb("data").$type<Record<string, any>>().default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const dbLogs = pgTable("dbLogs", {
    id: text("id").primaryKey(),
    databaseId: text("database_id").notNull().references(() => databases.id, { onDelete: "cascade" }),
    fromUserId: text("from_user_id").references(() => user.id, { onDelete: "no action" }),
    fromAppId: text("from_app_id").references(() => applications.id, { onDelete: "no action" }),
    code: text("type").$type<DbLogCode>().notNull(),
    data: jsonb("data").$type<Record<string, any>>().default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const appAnalytics = pgTable("app_analytics", {
    id: text("id").primaryKey(),
    applicationId: text("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
    type: text("type").$type<AnalyticsEventType>().notNull(),
    startDate: timestamp("start_date", {
        withTimezone: true,
        mode: "date"
    }).notNull(),
    endDate: timestamp("end_date", {
        withTimezone: true,
        mode: "date"
    }).notNull(),
    value: numeric("value", {mode: "number"}).notNull(),
    prevValue: numeric("prev_value", {mode: "number"}).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    
}, (table) => [
    unique("app_analytics_app_type_day_unique").on(
      table.applicationId,
      table.type,
      table.startDate,
    ),
])