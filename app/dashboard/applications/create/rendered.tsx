import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { applications, databases } from "@/lib/schema/schema";
import { eq, or } from "drizzle-orm";
import { CreateApplicationsForm } from "./form";
import { User } from "@/lib/schema/schemaTypes";
import { redirect } from "next/navigation";

export default async function CreateApplicationsRendered(){
    const createPerms = await userHasPermissionServer({applications: ["create"]});
    const requestPerms = await userHasPermissionServer({applications: ["request"]}, createPerms.user as User);
    const viewAllDbPerms = await userHasPermissionServer({databases: ["viewAll"]}, createPerms.user as User);
    if (!createPerms.isAuthorised && !requestPerms.isAuthorised) {
        return redirect("/dashboard/applications", "replace");
    }
    const fetchedDatabases = await db.query.databases.findMany({
        with: {
            owner: {
                columns: {
                    name: true,
                }
            },
            files: {
                columns: {
                    size: true
                }
            }
        },
        columns: {
            keys: false
        },
        where: {
            OR: [
                {ownerId: !viewAllDbPerms.isAuthorised ? viewAllDbPerms.user.id : {isNotNull: true}},
                {visibility: "public"}
            ]
        }
    })
    let dbCreatePerms;
    if (fetchedDatabases.length < 1) {
        dbCreatePerms = await userHasPermissionServer({databases: ["create"]}, createPerms.user as User);
    }
    const fetchedApps = await db.select({name: applications.name}).from(applications)
    return <CreateApplicationsForm fetchedApps={fetchedApps} dbCreatePerms={dbCreatePerms} fetchedDatabases={fetchedDatabases} createPerms={createPerms} requestPerms={requestPerms}/>;
}
