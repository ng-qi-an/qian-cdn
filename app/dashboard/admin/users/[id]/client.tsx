'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { authClient, roles } from "@/lib/auth-client";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";
import revalidateData from "@/lib/revalidateData";
import { session } from "@/lib/schema/auth-schema";
import { User } from "@/lib/schema/schemaTypes";
import { Ban, ChevronDown, ChevronUp, Copy, LaptopMinimal, LogIn, LogOut, MapPin, MoreHorizontal, Smartphone } from "lucide-react";
import { useState } from "react";
import { UAParser } from "ua-parser-js"
export default function UserPageClient({user, sessions}: {user: User, sessions: typeof session.$inferSelect[]}){
    const {data} = authClient.useSession();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    const [showMore, setShowMore] = useState(false);
    return <div className="mt-4 h-full overflow-auto p-0.5 min-h-0">
        {user.banned && <Card size="sm" className="mb-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Ban /> Banned!</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Ban reason</FieldLabel>
                        <p className="text-foreground mt-2">{user.banReason || "No reason provided."}</p>
                    </Field>
                    <Field>
                        <FieldLabel>Ban expiry</FieldLabel>
                        <p className="text-foreground mt-2">{user.banExpires ? user.banExpires.toLocaleString(undefined, {dateStyle: "long", timeStyle: "short"}) : "No expiry set."}</p>
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>}
        <form className="contents" onSubmit={async (e)=>{
            e.preventDefault();
            if (data?.user.role != "superAdmin" && user.role == "superAdmin") {
                toast.add({
                    title: "Error",
                    description: "You cannot edit a super admin.",
                    type: "error"
                })
                return
            }
            const { data: response, error } = await authClient.admin.updateUser({
                userId: user.id, // required, The user id which you want to update.
                data: { name: name, email: email, role: role }, // required, The data to update.
            });
            if (error) {
                toast.add({
                    title: "Error",
                    description: error.message,
                    type: "error"
                })
            } else {
                toast.add({
                    title: "Success",
                    description: "User updated successfully.",
                    type: "success"
                })
                await revalidateData(window.location.pathname)
            }
        }}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Personal details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input required type="text" value={name} onChange={(e)=> setName(e.target.value)}/>
                            </Field>
                            <Field>
                                <FieldLabel>Created on</FieldLabel>
                                <p className="text-foreground mt-2">{user.createdAt.toLocaleString(undefined, {dateStyle: "long", timeStyle: "short"})}</p>
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input required type="email" value={email} onChange={(e)=> setEmail(e.target.value)}/>
                        </Field>
                        <Field>
                            <FieldLabel>Role</FieldLabel>
                            <Select disabled={data?.user.id == user.id} items={roles.map((role)=> ({label: role.name, value: role.id}))} value={role} onValueChange={async (x)=>{
                                if (!x) return
                                setRole(x)
                            }}>
                                <SelectTrigger className="w-42">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role)=>{
                                        return <SelectItem disabled={!checkUserHasHigherPerms(data?.user?.role!, role.id)} key={role.id} value={role.id}>{role.name}</SelectItem>
                                    })}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel>User ID</FieldLabel>
                            <InputGroup>
                                <InputGroupInput type="text" value={user.id} readOnly/>
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton size="icon-sm" onClick={()=>{
                                        navigator.clipboard.writeText(user.id)
                                    }}><Copy/></InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </FieldGroup>
                </CardContent>
                <CardFooter>
                    <Button size="sm" type="submit">Save changes</Button>
                </CardFooter>
            </Card>
        </form>
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Active sessions</CardTitle>
                <CardDescription>Shows active sign-ins, starting with the latest.</CardDescription>
                <CardAction>
                    <Button disabled={sessions.length == 0} size="sm" variant="secondary" onClick={async()=>{
                        const { data, error } = await authClient.admin.revokeUserSessions({
                            userId: user.id,
                        });
                        if (error) {
                            toast.add({
                                title: "Error",
                                description: error.message,
                                type: "error"
                            })
                        } else {
                            toast.add({
                                title: "Success",
                                description: "All sessions revoked successfully.",
                                type: "success"
                            })
                            await revalidateData(window.location.pathname)
                        }
                    }}>Revoke all sessions</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="gap-2 flex flex-col items-center">
                    {sessions.length > 0 ? sessions.map((session)=>{
                        if (!showMore && sessions.indexOf(session) > 2) return null
                        const parser = new UAParser(session.userAgent || "Unknown");
                        const results = parser.getResult();
                        return <Item key={session.id} variant="outline">
                            <ItemMedia>
                                {results.device.type == "mobile" ? 
                                    <Smartphone/>
                                : <LaptopMinimal/>}
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>{results.browser.name} on {results.device.model || results.os.name} {data?.session.id == session.id && <Badge variant="default">Current</Badge>}</ItemTitle>
                                <ItemDescription>{!session.cityName && !session.countryName ? "Unknown location" : (session.cityName ?? "Unknown city") + ", " + (session.countryName ?? "Unknown country")} - Signed in on {session.createdAt.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <DropdownMenu>
                                    <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost">
                                        <MoreHorizontal/>
                                    </Button>}/>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={async()=>{
                                            if (!session.latitude || !session.longitude) {
                                                return toast.add({
                                                    title: "Error",
                                                    description: "No location data available for this session.",
                                                    type: "error"
                                                })
                                            }
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${session.latitude},${session.longitude}`, "_blank")
                                        }}><MapPin/>View location</DropdownMenuItem>
                                        <DropdownMenuItem variant="destructive" disabled={data?.session.id == session.id} onClick={async()=>{
                                            const {data, error} = await authClient.admin.revokeUserSession({
                                                sessionToken: session.token
                                            })
                                            if (error) {
                                                toast.add({
                                                    title: "Error",
                                                    description: error.message,
                                                    type: "error"
                                                })
                                            } else {
                                                toast.add({
                                                    title: "Success",
                                                    description: "Session revoked successfully.",
                                                    type: "success"
                                                })
                                                await revalidateData(window.location.pathname)
                                            }
                                        }}><LogOut/>Revoke session</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </ItemActions>
                        </Item>
                    }) : <Empty>
                        <EmptyMedia variant="icon">
                            <LogIn/>
                        </EmptyMedia> 
                        <EmptyHeader>
                            <EmptyTitle>No sessions found</EmptyTitle>
                            <EmptyDescription>This user is not currently logged in on any device.</EmptyDescription>
                        </EmptyHeader>   
                    </Empty>}
                    {sessions.length > 3 && <Button variant="link" size="sm" className="mt-2" onClick={()=>setShowMore(!showMore)}>{showMore ? <>Show less <ChevronUp/></> : <>Show more <ChevronDown/></>}</Button>}
                </div>
            </CardContent>
        </Card>
    </div>
}