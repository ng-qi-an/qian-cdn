"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "../features"
import { Files } from "@/lib/schema/schemaTypes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ExternalLink, MoreHorizontal, Pen, Trash } from "lucide-react"
import { convertFromBytesToSensible } from "@/lib/unitConverter"
import { mimeToIcon, mimeToReadable } from "@/lib/fileTypes"
import RenameFileDialog from "./RenameFileDialog"
import { useState } from "react"
import DeleteFileDialog from "./DeleteFileDialog"
import { Checkbox } from "@/components/ui/checkbox"
import SortedColumnHeader from "../SortedColumnHeader"
import Link from "next/link"


// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Files>()

export const filesColumns = columnHelper.columns([
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
        header: ({column})=> <SortedColumnHeader column={column}>Name</SortedColumnHeader>,
        cell: ({row}) => {
            const name = row.original.name
            const Icon = mimeToIcon(row.original.contentType)
            return <div className="flex items-center">
                <Icon className="size-4 mr-2"/>
                {name}
                
            </div>
        }
    }),
    columnHelper.accessor("contentType", {
        header: ({column}) => "Type",
        cell: ({row}) => {
            const contentType = row.original.contentType
            return mimeToReadable(contentType)
        }
    }),
    columnHelper.accessor("size", {
        header: ({column}) => <SortedColumnHeader column={column}>Size</SortedColumnHeader>,
        cell: ({row}) => {
            const size = convertFromBytesToSensible(row.original.size)
            return size.value.toFixed(2) + size.unit.toUpperCase()
        }
    }),
    columnHelper.accessor("createdAt", {
        header: ({column}) => <SortedColumnHeader column={column}>Created at</SortedColumnHeader>,
        cell: ({row}) => {
            const createdAt = new Date(row.original.createdAt)
            return createdAt.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})
        }
    }),
    columnHelper.accessor("updatedAt", {
        header: ({column}) => <SortedColumnHeader column={column}>Last modified</SortedColumnHeader>,
        cell: ({row}) => {
            const updatedAt = new Date(row.original.updatedAt)
            return updatedAt.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})
        }
    }),
    columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
        const [openRename, setOpenRename] = useState(false)
        const [openDelete, setOpenDelete] = useState(false)
        return <div className="flex justify-end w-full">
            <RenameFileDialog currentName={row.original.name} fileId={row.original.id} open={openRename} onOpenChange={setOpenRename}/>
            <DeleteFileDialog fileId={row.original.id} open={openDelete} onOpenChange={setOpenDelete}/>
            <Link href={`/api/files/${row.original.id}`} target="_blank">
                <Button variant="ghost" size="icon-sm">
                    <ExternalLink/>
                </Button>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm">
                    <MoreHorizontal />
                </Button>}/>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => setOpenRename(true)}><Pen/> Rename</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={()=> setOpenDelete(true)}><Trash/>Delete</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        },
    }),
])