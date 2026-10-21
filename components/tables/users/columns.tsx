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


// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, User>()

export type UserColumnsProps = {
    impersonateUserAuth: boolean,
    impersonateAdminAuth: boolean,
    banUserAuth: boolean,
    deleteUserAuth: boolean,
    user: User
}

export function getUserColumns({impersonateUserAuth, impersonateAdminAuth, banUserAuth, deleteUserAuth, user}: UserColumnsProps){
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
                        <Link href={`/dashboard/admin/users/${row.original.id}`} title="View user details">
                            <p>{row.original.name}</p>
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
                return <Select disabled={row.original.id === user.id || (user.role == "admin" && (row.original.role == "superAdmin" || row.original.role == "admin"))} items={roles.map((role)=> ({label: role.name, value: role.id}))} value={role} onValueChange={async (x)=>{
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
                    }
                    
                }}>
                    <SelectTrigger className="w-42">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role)=>{
                            return <SelectItem disabled={user.role == "admin" && (role.id == "superAdmin" || role.id == "admin")} key={role.id} value={role.id}>{role.name}</SelectItem>
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
                            <Link href={`/dashboard/admin/users/${row.original.id}`}>
                                <DropdownMenuItem><Eye/> View user</DropdownMenuItem>
                            </Link>
                            {impersonateUserAuth && <DropdownMenuItem disabled={targetUserHigherOrSimilarPerms || row.original.role == "admin" && !impersonateAdminAuth || user.id == row.original.id}><UserIcon/> Impersonate</DropdownMenuItem>}
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem variant="destructive" disabled={targetUserHigherOrSimilarPerms || !banUserAuth || user.id == row.original.id} onClick={()=> setOpenBan(true)}><Ban/> Ban</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" disabled={targetUserHigherOrSimilarPerms || !deleteUserAuth || user.id == row.original.id} onClick={()=> setOpenDelete(true)}><Trash/>Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            },
        }),
    ])
}