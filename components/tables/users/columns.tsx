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
                return <Link href={`/dashboard/admin/users/${row.original.id}`} title="View user details">
                    <div className="flex items-center cursor-pointer">
                        <Avatar className="h-8 w-8 rounded-lg mr-3">
                            <AvatarImage src={row.original.image || undefined} alt={row.original.name} />
                            <AvatarFallback className="rounded-full">{row.original.name}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p>{row.original.name}</p>
                            <p className="text-muted-foreground">{row.original.email}</p>
                        </div>
                    </div>
                </Link>
            }
        }),
        columnHelper.accessor("role", {
            header: ({column}) => <SortedColumnHeader column={column}>Role</SortedColumnHeader>,
            cell: ({row}) => {
                return row.original.role
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