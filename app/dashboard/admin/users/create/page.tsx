import { db } from "@/lib/db";
import { user } from "@/lib/schema/auth-schema";
import ClientUsersPage from "./client";
import { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
    title: 'Create user',
};

export default async function UserCreatePage(){
    const fetchedUsers = await db.select({email: user.email}).from(user);
    return <ClientUsersPage fetchedUsers={fetchedUsers}/>
}