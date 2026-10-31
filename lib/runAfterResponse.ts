import { after } from "next/server";

// Runs work after the response is sent when a request scope is available,
// falling back to running it immediately otherwise (e.g. scripts, cron jobs).
// Fire-and-forget: errors are logged, never propagated to the caller.
export function runAfterResponse(work: () => Promise<void>): void {
    const safeWork = () => work().catch((error) => console.error("Error running deferred work:", error));
    try {
        after(safeWork);
    } catch {
        safeWork();
    }
}