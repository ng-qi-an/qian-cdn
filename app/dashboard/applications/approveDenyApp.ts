'use server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { InsufficientPermissionsError, UnauthorisedError } from "@/lib/errors";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { applications } from "@/lib/schema/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function approveDenyApp(appId: string, action: "approve" | "deny") {
    const data = await auth.api.getSession({
        headers: await headers()
    });
    if (!data || !data.user) {
        throw new UnauthorisedError();
    }
    const approvePerms = await userHasPermissionServer({applications: ["reviewRequests"]}, data.user);
    if (!approvePerms.isAuthorised) {
        throw new InsufficientPermissionsError();
    }
    if (action == "approve"){
        await db.update(applications).set({status: "active"}).where(eq(applications.id, appId));
    } else {
        await db.delete(applications).where(and(eq(applications.id, appId), eq(applications.status, "requested")));
    }
    return { status: "OK", message: `Application ${action}d successfully` };
}