import { db } from "@/lib/db";
import { getDateRange } from "@/lib/time";
import { appAnalytics } from "@/lib/schema/schema";
import { sql } from "drizzle-orm";
import { generateId } from "better-auth";
import { runAfterResponse } from "@/lib/runAfterResponse";

export default async function updateRequestsAnalyticsEvent({increment, appId, timezone}: {increment: number, appId: string, timezone: string}){
    const { start, end } = getDateRange(new Date(), 1, timezone);
    // Runs after the response is sent so analytics doesn't block the caller
    runAfterResponse(async () => {
        try {
            await db.insert(appAnalytics).values({
                id: generateId(16),
                applicationId: appId,
                type: "requests",
                value: increment,
                prevValue: 0,
                startDate: start,
                endDate: end,
            }).onConflictDoUpdate({
                target: [
                    appAnalytics.applicationId,
                    appAnalytics.type,
                    appAnalytics.startDate,
                ],
                set: {
                    value: sql`${appAnalytics.value} + ${increment}`,
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            console.error("Error updating requests analytics:", error);
        }
    });
}