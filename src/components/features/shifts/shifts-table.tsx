"use client"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pencil, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableContainer } from "@/components/ui/table-container"
import { formatTimeDisplay } from "@/lib/utils/time"
import type { Shift } from "@/types/shift"

export type ShiftsTableProps = {
  data: Shift[]
  onEdit: (shift: Shift) => void
  onDelete: (shift: Shift) => void
  deletingId?: string | null
}

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const

export function ShiftsTable({
  data,
  onEdit,
  onDelete,
  deletingId = null
}: ShiftsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<Shift>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ getValue }) => (
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {getValue<string>()}
          </span>
        )
      },
      {
        accessorKey: "start_time",
        header: "Início",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatTimeDisplay(getValue<string>())}
          </span>
        )
      },
      {
        accessorKey: "end_time",
        header: "Fim",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatTimeDisplay(getValue<string>())}
          </span>
        )
      },
      {
        accessorKey: "created_at",
        header: "Criado em",
        cell: ({ getValue }) => (
          <span className="hidden tabular-nums text-zinc-500 sm:inline">
            {format(new Date(getValue<string>()), "dd/MM/yyyy HH:mm", {
              locale: ptBR
            })}
          </span>
        )
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => {
          const shift = row.original
          const isDeleting = deletingId === shift.id

          return (
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Editar ${shift.name}`}
                onClick={() => onEdit(shift)}
                disabled={isDeleting}
                icon={Pencil}
              >
                <span className="sr-only sm:not-sr-only">Editar</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                aria-label={`Excluir ${shift.name}`}
                onClick={() => onDelete(shift)}
                isLoading={isDeleting}
                icon={Trash2}
              >
                <span className="sr-only sm:not-sr-only">Excluir</span>
              </Button>
            </div>
          )
        }
      }
    ],
    [onEdit, onDelete, deletingId]
  )

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase().trim()

      if (!search) {
        return true
      }

      const { name, start_time, end_time } = row.original

      return (
        name.toLowerCase().includes(search) ||
        formatTimeDisplay(start_time).includes(search) ||
        formatTimeDisplay(end_time).includes(search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  })

  const filteredCount = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount)

  return (
    <TableContainer
      toolbar={
        <div className="relative max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Buscar turno..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
            aria-label="Buscar turno"
          />
        </div>
      }
    >
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 font-medium text-zinc-500 first:rounded-tl-ios-card last:rounded-tr-ios-card"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-zinc-100 transition-colors duration-300 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-3 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          {filteredCount === 0
            ? "Nenhum registro"
            : `Exibindo ${from}–${to} de ${filteredCount}`}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-zinc-500">
            Por página
            <select
              className="rounded-ios-btn border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={pageSize}
              onChange={(event) =>
                table.setPageSize(Number(event.target.value))
              }
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span className="text-sm text-zinc-500">
            {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount || 1}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </TableContainer>
  )
}
