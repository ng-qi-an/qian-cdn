import { db } from "@/lib/db";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import { user } from "@/lib/schema/auth-schema";
import { desc } from "drizzle-orm";
import UsersClientPage from "./client";

export default async function RenderedUsers(){
    const users = await db.select().from(user).orderBy(desc(user.createdAt))
    const banUserPerms = await userHasPermissionServer({user: ["ban"]})
    const deleteUserPerms = await userHasPermissionServer({user: ["delete"]})
    return <UsersClientPage users={users} banUserAuth={banUserPerms.isAuthorised} deleteUserAuth={deleteUserPerms.isAuthorised} user={deleteUserPerms.user}/>
}