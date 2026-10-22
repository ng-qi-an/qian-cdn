"use client";
import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "../features"
import { User } from "@/lib/schema/schemaTypes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Ban, Eye, MoreHorizontal, Trash, UserIcon } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import SortedColumnHeader from "../SortedColumnHeader"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authClient, roles } from "@/lib/auth-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { checkUserHasHigherPerms } from "@/lib/permissions/permissionHelpers";
import { Badge } from "@/components/ui/badge";


// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, User>()

export type UserColumnsProps = {
    banUserAuth: boolean,
    deleteUserAuth: boolean,
    user: User
}

export function getUserColumns({banUserAuth, deleteUserAuth, user}: UserColumnsProps){
    return columnHelper.columns([
        columnHelper.display({
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    indeterminate={
                    table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }),
        columnHelper.accessor("name", {
            header: ({column})=> <SortedColumnHeader column={column}>User</SortedColumnHeader>,
            cell: ({row}) => {
                const nameParts = row.original.name.split(" ")
                const initials = (nameParts[0].charAt(0) + (nameParts[1] ? nameParts[1].charAt(0) : "")).toUpperCase()
                return <div className="flex items-center">
                    <Avatar className="h-8 w-8 rounded-lg mr-3">
                        <AvatarImage src={row.original.image || undefined} alt={row.original.name} />
                        <AvatarFallback className="rounded-full">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <Link href={checkUserHasHigherPerms(user.role!, row.original.role!) ? `/dashboard/admin/users/${row.original.id}` : "#"} title={checkUserHasHigherPerms(user.role!, row.original.role!) ? "View user details" : "No permission to view user"} className={`flex items-center ${checkUserHasHigherPerms(user.role!, row.original.role!) ? "group" : "cursor-not-allowed"}`}>
                            <p className={'group-hover:underline'}>{row.original.name}</p>
                            {row.original.banned && <Badge variant="destructive" className="ml-2 bg-destructive/10 px-1">Banned</Badge>}
                        </Link>
                        <p className="text-muted-foreground">{row.original.email}</p>
                    </div>
                </div>
            }
        }),
        columnHelper.accessor("role", {
            header: ({column}) => <SortedColumnHeader column={column}>Role</SortedColumnHeader>,
            cell: ({row}) => {
                const [role, setRole] = useState(row.original.role)
                return <Select disabled={row.original.id === user.id || !checkUserHasHigherPerms(user.role!, row.original.role!)} items={roles.map((role)=> ({label: role.name, value: role.id}))} value={role} onValueChange={async (x)=>{
                    setRole(x)
                    if (!x) return
                    const { data, error } = await authClient.admin.setRole({
                        userId: row.original.id,
                        role: x,
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
                            description: "User role updated successfully.",
                            type: "success"
                        })
                    }
                    
                }}>
                    <SelectTrigger className="w-42">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role)=>{
                            return <SelectItem disabled={!checkUserHasHigherPerms(user.role!, role.id)} key={role.id} value={role.id}>{role.name}</SelectItem>
                        })}
                    </SelectContent>
                </Select>
            }
        }),
        columnHelper.accessor("createdAt", {
            header: ({column}) => <SortedColumnHeader column={column}>Created at</SortedColumnHeader>,
            cell: ({row}) => {
                const createdAt = new Date(row.original.createdAt)
                return createdAt.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})
            }
        }),
        columnHelper.display({
            id: "actions",
            cell: ({ row }) => {
            const [openBan, setOpenBan] = useState(false)
            const [openDelete, setOpenDelete] = useState(false)
            const targetUserHigherOrSimilarPerms = user.role == row.original.role || (user.role != "superAdmin" && row.original.role == "superAdmin")
            return <div className="flex justify-end w-full">
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm">
                        <MoreHorizontal />
                    </Button>}/>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Link href={checkUserHasHigherPerms(user.role!, row.original.role!) ? `/dashboard/admin/users/${row.original.id}` : "#"} className={`${checkUserHasHigherPerms(user.role!, row.original.role!) ? "" : "cursor-default"}`} title={checkUserHasHigherPerms(user.role!, row.original.role!) ? "" : "No permission to view user"}>
                                <DropdownMenuItem  disabled={!checkUserHasHigherPerms(user.role!, row.original.role!)}><Eye/> View user</DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem variant="destructive" disabled={!checkUserHasHigherPerms(user.role!, row.original.role!) || !banUserAuth || user.id == row.original.id} onClick={()=> setOpenBan(true)}><Ban/> Ban</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" disabled={!checkUserHasHigherPerms(user.role!, row.original.role!) || !deleteUserAuth || user.id == row.original.id} onClick={()=> setOpenDelete(true)}><Trash/>Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            },
        }),
    ])
}