'use server';
import { makeAuditLog } from "@/lib/actions/logs/makeAuditLog";
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
    const appData = await db.query.applications.findFirst({
        where: {
            id: appId,
        },
        columns: {
            id: true,
            name: true,
            status: true
        },
        with: {
            owner: {
                columns: {
                    id: true,
                    name: true
                }
            }
        }
    })
    if (!appData) {
        throw new Error("Application not found.");
    }
    if (appData.status != "requested") {
        throw new Error("Application is not in a requested state.");
    }
    if (action == "approve"){
        await makeAuditLog({userId: data.user.id, code: "APPLICATION_REVIEWED", data: {application: {id: appId, name: appData.name, owner: appData.owner}, approved: true}});
        await db.update(applications).set({status: "active"}).where(eq(applications.id, appId));
    } else {
        await makeAuditLog({userId: data.user.id, code: "APPLICATION_REVIEWED", data: {application: {id: appId, name: appData.name, owner: appData.owner}, approved: false}});
        await db.delete(applications).where(and(eq(applications.id, appId), eq(applications.status, "requested")));
    }
    return { status: "OK", message: `Application ${action}d successfully` };
}