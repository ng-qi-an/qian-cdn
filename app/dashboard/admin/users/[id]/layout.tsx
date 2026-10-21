import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserTabs from "./UserTabs";
import { Button } from "@/components/ui/button";
import { Ban, Key, Pen, Trash, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const instant = false;

export default async function UserLayout({children, params}: {children: React.ReactNode, params: Promise<{id: string}>}){
    const { id } = await params;
    const data = await auth.api.getUser({
        query: {
            id,
        },
        headers: await headers(),
    });
    if (!data) {
        return redirect("/dashboard/admin/users");
    }
    const nameParts = data.name.split(" ")
    const initials = (nameParts[0].charAt(0) + (nameParts[1] ? nameParts[1].charAt(0) : "")).toUpperCase()
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Users", href: "/dashboard/admin/users"}, {name: data.name}]}/>
        <DashboardBody className="flex lg:flex-row">
            <div className="lg:h-full w-full lg:max-w-[250px]">
                <Avatar className="mr-3 h-auto w-full max-w-[300px] aspect-square after:border-none">
                    <AvatarImage src={data.image || undefined} alt={data.name} />
                    <AvatarFallback className="rounded-none  text-4xl">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-medium">{data.name}</h2>
                <p className="text-muted-foreground">{data.email}</p>
                <div className="space-y-2 mt-4">
                    <Button className="w-full" size="sm" variant="outline"><Pen/> Edit details</Button>
                    <Button className="w-full" size="sm" variant="outline"><Key/> Change password</Button>
                    <Button className="w-full" size="sm" variant="outline"><User/> Impersonate</Button>
                    <Separator className="my-2"/>
                    <Button className="w-full" size="sm" variant="destructive"><Ban/> Ban</Button>
                    <Button className="w-full" size="sm" variant="destructive"><Trash/> Delete</Button>
                </div>
            </div>
            <div className="ml-4 mt-4 lg:mt-0 w-full">
                <UserTabs userId={id}/>
                {children}
            </div>
        </DashboardBody>
    </Dashboard>
}