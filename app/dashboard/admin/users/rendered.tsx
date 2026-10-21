import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissionHelpers";
import { user } from "@/lib/schema/auth-schema";
import { desc } from "drizzle-orm";
import UsersClientPage from "./client";

export default async function RenderedUsers(){
    const users = await db.select().from(user).orderBy(desc(user.createdAt))
    const impersonateUserPerms = await userHasPermissionServer({user: ["impersonate"]})
    const impersonateAdmins = await userHasPermissionServer({user: ["impersonate-admins"]})
    const banUserPerms = await userHasPermissionServer({user: ["ban"]})
    const deleteUserPerms = await userHasPermissionServer({user: ["delete"]})
    return <UsersClientPage users={users} impersonateUserAuth={impersonateUserPerms.isAuthorised} impersonateAdminAuth={impersonateAdmins.isAuthorised} banUserAuth={banUserPerms.isAuthorised} deleteUserAuth={deleteUserPerms.isAuthorised} user={deleteUserPerms.user}/>
}