import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserTabs from "./UserTabs";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";
import UserActions from "./UserActions";
import { user as userSchema } from "@/lib/schema/auth-schema";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
export const instant = false;

export default async function UserLayout({children, params}: {children: React.ReactNode, params: Promise<{id: string}>}){
    const { id } = await params;
    const data = (await db.select().from(userSchema).where(eq(userSchema.id, id)))[0];
    if (!data) {
        return redirect("/dashboard/admin/users");
    }
    const nameParts = data.name.split(" ")
    const initials = (nameParts[0].charAt(0) + (nameParts[1] ? nameParts[1].charAt(0) : "")).toUpperCase()
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!checkUserHasHigherPerms(session?.user?.role!, data.role!)) {
        return redirect("/dashboard/admin/users");
    }
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Users", href: "/dashboard/admin/users"}, {name: data.name}]}/>
        <DashboardBody className="flex lg:flex-row">
            <div className="lg:h-full w-full lg:max-w-[250px]">
                <Avatar className="mr-3 h-auto w-full max-w-[300px] aspect-square after:border-none">
                    <AvatarImage src={data.image || undefined} alt={data.name} />
                    <AvatarFallback className="rounded-none  text-4xl">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-medium flex items-center">{data.name} {data.banned && <Badge variant="destructive" className="ml-2 bg-destructive/10 px-1">Banned</Badge>}</h2>
                <p className="text-muted-foreground">{data.email}</p>
                <UserActions user={data as typeof userSchema.$inferSelect} currentUser={session?.user!} />
            </div>
            <div className="lg:ml-6 mt-4 lg:mt-0 w-full flex flex-col">
                <UserTabs userId={id}/>
                {children}
            </div>
        </DashboardBody>
    </Dashboard>
}