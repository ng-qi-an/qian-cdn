import { db } from "@/lib/db";
import { getDateRange } from "@/lib/time";
import { appAnalytics, files } from "@/lib/schema/schema";
import { eq, sum } from "drizzle-orm";
import { generateId } from "better-auth";
import { runAfterResponse } from "@/lib/runAfterResponse";

export default async function updateSizeAnalyticsEvent({increment, appId, timezone}: {increment: number, appId: string, timezone: string}){
    const { start, end } = getDateRange(new Date(), 1, timezone);
    // Runs after the response is sent so analytics doesn't block the caller
    runAfterResponse(async () => {
        try {
            const totalSize = (await db.select({ totalSize: sum(files.size) }).from(files).where(eq(files.applicationId, appId)))[0]?.totalSize;
            const currentFileSize = totalSize == null ? 0 : Number(totalSize);
            await db.insert(appAnalytics).values({
                id: generateId(16),
                applicationId: appId,
                type: "size",
                value: currentFileSize,
                prevValue: currentFileSize - increment,
                startDate: start,
                endDate: end,
            }).onConflictDoUpdate({
                target: [
                    appAnalytics.applicationId,
                    appAnalytics.type,
                    appAnalytics.startDate,
                ],
                set: {
                    value: currentFileSize,
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            console.error("Error updating size analytics:", error);
        }
    });
}