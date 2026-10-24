import { auth } from "../auth";
import { applications, appLogs, databases, dbLogs, files } from "./schema";

export type User = typeof auth.$Infer.Session.user;

export type Database = typeof databases.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Files = typeof files.$inferSelect;
export type AppLog = typeof appLogs.$inferSelect;
export type DbLog = typeof dbLogs.$inferSelect;