"use client"

import { ColumnFiltersState, PaginationState, RowSelectionState, SortingState, useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { features, type DataTableFeatures } from "../features"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Search } from "lucide-react"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
}

export function UsersDataTable<TData extends RowData>({
  columns,
  data,
}: DataTableProps<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [openDeleteFiles, setOpenDeleteFiles] = useState(false);
  const table = useTable({
    features,
    data,
    columns,
    autoResetPageIndex: false,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row) => String((row as { id: string | number }).id),
    state: {
      pagination,
      rowSelection,
      sorting,
      columnFilters
    }
  })
  return <div className="flex flex-col h-full">
      <div className="flex items-center mb-2 justify-between">
        <InputGroup className="w-full max-w-xs">
          <InputGroupAddon align="inline-start">
            <Search/>
          </InputGroupAddon>
          <InputGroupInput placeholder="Filter users..." value={table.getColumn("name")?.getFilterValue() as string ?? ""} onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)} />
        </InputGroup>
      </div>
      <div className="min-w-0 max-w-full overflow-y-auto border dark:border-none dark:bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} highlightOnHover={false}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
          </TableFooter>
        </Table>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-4 pt-4">
        <div className='flex items-center w-full'>
          {data.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">Showing {table.getPaginatedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} results</p>
          )}
          <div className='flex-1'/>
          <div className="text-sm text-muted-foreground">
            Showing
            <Input type="" className="w-12 text-center text-foreground" value={pagination.pageSize} onChange={(e) => Number(e.target.value) > 0 && setPagination({...pagination, pageSize: Number(e.target.value)})} />
            rows per page
          </div>
        </div>
        <div className="space-x-2 ml-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      {table.getFilteredSelectedRowModel().rows.length > 0 && <div className="absolute bottom-0 bg-secondary border p-2 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 overflow-hidden">
        <p className="text-sm mr-2">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected
        </p>
        <Button size="xs" variant="outline" onClick={()=> table.resetRowSelection()}>Unselect</Button>
        <Button size="xs" variant="destructive" onClick={()=> setOpenDeleteFiles(true)}>Delete</Button>
      </div>}
    </div>
}