import { integer, timestamp, jsonb, numeric, pgTable, text } from "drizzle-orm/pg-core";
import { apikey, user } from "./auth-schema";
import type { AppLogCode } from "../actions/logs/codes";

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