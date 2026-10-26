import { db } from "@/lib/db";
import { getDateRange } from "@/lib/time";
import { appAnalytics, files } from "@/lib/schema/schema";
import { count, eq, sum } from "drizzle-orm";
import { generateId } from "better-auth";

export default async function updateFilesAnalyticsEvent({increment, appId, timezone}: {increment: number, appId: string, timezone: string}){
    const { start, end } = getDateRange(new Date(), 1, timezone);
    const { fileCount } = (await db.select({ fileCount: count()}).from(files).where(eq(files.applicationId, appId)))[0];
    const currentFilesCount = Number(fileCount);
    return await db.insert(appAnalytics).values({
        id: generateId(16),
        applicationId: appId,
        type: "files",
        value: currentFilesCount,
        prevValue: currentFilesCount - increment,
        startDate: start,
        endDate: end,
    }).onConflictDoUpdate({
        target: [
            appAnalytics.applicationId,
            appAnalytics.type,
            appAnalytics.startDate,
        ],
        set: {
            value: currentFilesCount,
            updatedAt: new Date(),
        },
    });
}