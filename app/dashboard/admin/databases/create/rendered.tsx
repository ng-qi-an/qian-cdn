import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { databases } from "@/lib/schema/schema";
import { eq, or } from "drizzle-orm";
import { CreateDatabasesForm } from "./form";
import { User } from "@/lib/schema/schemaTypes";
import { redirect } from "next/navigation";

export default async function CreateDatabasesRendered(){
    const createPerms = await userHasPermissionServer({databases: ["create"]});
    if (!createPerms.isAuthorised) {
        return redirect("/dashboard/admin/databases", "replace");
    }
    const fetchedDatabases = await db.select({name: databases.name}).from(databases);
    return <CreateDatabasesForm fetchedDatabases={fetchedDatabases} createPerms={createPerms}/>;
}
