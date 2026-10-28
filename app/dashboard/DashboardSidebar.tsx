import { Label } from "@/components/ui/label";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { AppWindowMac, Book, Cloud, Database, ExternalLink, Home, Key, Logs, Search, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import UserDropdown from "./UserDropdown";
import DashboardSidebarLink from "./DashboardSidebarLink";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export default async function DashboardSidebar() {
    const data = await auth.api.getSession({
        headers: await headers()
    })
    if (!data?.user) return null;
    
    const links: {[header: string]: {name: string, href: string, icon: React.ReactNode}[]} = {
        navigation: [
            {name: "Dashboard", href: "/dashboard", icon: <Home/>},
            {name: "Applications", href: "/dashboard/applications", icon: <AppWindowMac/>},
            {name: "API Keys", href: "/dashboard/api-keys", icon: <Key/>},
            {name: "Logs", href: "/dashboard/logs", icon: <Logs/>},
        ],
        ...(data.user.role == "admin" || data.user.role == "superAdmin" ? {
            management: [
                    {name: "Users", href: "/dashboard/admin/users", icon: <Users/>},
                    {name: "Databases", href: "/dashboard/admin/databases", icon: <Database/>},
                    {name: "Audit", href: "/dashboard/admin/audit", icon: <Shield/>},
                    {name: "Settings", href: "/dashboard/admin/settings", icon: <Settings/>},
            ],
        } : {}),
        help: [
            {name: "Documentation", href: "/", icon: <Book/>},
            {name: "Github", href: "/", icon: <ExternalLink/>},
        ]
    }
    return <Sidebar>
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-2! mt-1 hover:bg-transparent active:bg-transparent">
                        <Cloud className="size-5.5!"/>
                        <span className="text-base font-semibold ml-1">Unified CDN</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                    <Label htmlFor="search" className="sr-only">
                        Search
                    </Label>
                    <SidebarInput
                        id="search"
                        placeholder="Search for anything..."
                        className="pl-8"
                    />
                    <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarHeader>
        <SidebarContent>
            {Object.values(links).map((group, index: number) => {
              return <SidebarGroup key={index}>
                <SidebarGroupLabel>{Object.keys(links)[index]}</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {group.map((link, index: number) => {
                            return <DashboardSidebarLink key={index} href={link.href} Icon={link.icon} name={link.name}/>
                        })}
                    </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>  
            })}
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Suspense fallback={<div className="p-2">Loading...</div>}>
                        <UserDropdown/>
                    </Suspense>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
}