"use client"

import { ColumnFiltersState, PaginationState, SortingState, useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

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
import { AppWindowMac, ListFilter } from "lucide-react"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { appLogCodes } from "@/lib/actions/logs/codes"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  type: "app"
}

type LogWithApplication = {
  application?: {
    id: string | number
    name: string
  }
}

export function LogsDataTable<TData extends RowData>({
  columns,
  data,
  type
}: DataTableProps<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const table = useTable({
    features,
    data,
    columns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row) => String((row as { id: string | number }).id),
    state: {
      pagination,
      sorting,
      columnFilters
    }
  })
  const apps: { label: string; value: string }[] = []
  const appIds = new Set<string>()

  data.forEach((log) => {
    const app = (log as TData & LogWithApplication).application
    if (!app) return

    const value = String(app.id)
    if (!appIds.has(value)) {
      appIds.add(value)
      apps.push({ label: String(app.name), value })
    }
  })
  const applicationColumn = table.getColumn("applicationId")
  const codeColumn = table.getColumn("code")
  const selectedApplicationId = applicationColumn?.getFilterValue() as string | undefined
  const selectedApplication = apps.find((app) => app.value === selectedApplicationId) ?? null
  const selectedCode = codeColumn?.getFilterValue() as string | undefined

  return <div className="flex flex-col h-full">
      <div className="flex items-center mb-2 pt-2 gap-2">
        {apps.length > 0 && <>
        <AppWindowMac className="size-4 text-muted-foreground"/>
        <Combobox
          items={apps}
          value={selectedApplication}
          itemToStringValue={(app) => app.label}
          onValueChange={(app) => applicationColumn?.setFilterValue(app?.value ?? undefined)}
        >
          <ComboboxInput showClear className="w-full max-w-xs" placeholder="Filter applications"/>
          <ComboboxContent>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        </>}
        <ListFilter className="size-4 text-muted-foreground"/>
        <Combobox
          items={type === "app" ? appLogCodes : ["?"]}
          value={selectedCode ?? null}
          onValueChange={(value) => codeColumn?.setFilterValue(value ?? undefined)}
        >
          <ComboboxInput showClear className="w-full max-w-xs" placeholder="Filter actions"/>
          <ComboboxContent>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
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
                  highlightOnHover={false}
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
    </div>
}
