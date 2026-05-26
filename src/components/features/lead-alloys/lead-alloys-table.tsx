"use client"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState
} from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pencil, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TableContainer } from "@/components/ui/table-container"
import type { LeadAlloy } from "@/types/lead-alloy"

export type LeadAlloysTableProps = {
  data: LeadAlloy[]
  onEdit: (leadAlloy: LeadAlloy) => void
  onDelete: (leadAlloy: LeadAlloy) => void
  deletingId?: string | null
}

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const
const ALL_DESCRIPTIONS = "all"

const DESCRIPTION_FILTER_OPTIONS = [
  { value: ALL_DESCRIPTIONS, label: "Todas as ligas" },
  { value: "with_description", label: "Com descrição" },
  { value: "without_description", label: "Sem descrição" }
] as const

function hasDescription(description: string | null): boolean {
  return Boolean(description?.trim())
}

function matchesDescriptionFilter(
  description: string | null,
  filterValue: string
): boolean {
  switch (filterValue) {
    case "with_description":
      return hasDescription(description)
    case "without_description":
      return !hasDescription(description)
    default:
      return true
  }
}

export function LeadAlloysTable({
  data,
  onEdit,
  onDelete,
  deletingId = null
}: LeadAlloysTableProps) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: "description_filter", value: ALL_DESCRIPTIONS }
  ])

  const descriptionFilterValue =
    (columnFilters.find((filter) => filter.id === "description_filter")
      ?.value as string | undefined) ?? ALL_DESCRIPTIONS

  const columns = useMemo<ColumnDef<LeadAlloy>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Código",
        cell: ({ getValue }) => (
          <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
            {getValue<string>()}
          </span>
        )
      },
      {
        accessorKey: "description",
        header: "Descrição",
        id: "description_filter",
        filterFn: (row, _columnId, filterValue) =>
          matchesDescriptionFilter(
            row.original.description,
            String(filterValue)
          ),
        cell: ({ getValue }) => {
          const description = getValue<string | null>()

          return (
            <span className="text-zinc-700 dark:text-zinc-300">
              {description?.trim() ? description : "—"}
            </span>
          )
        }
      },
      {
        accessorKey: "created_at",
        header: "Criado em",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-500">
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
          const leadAlloy = row.original
          const isDeleting = deletingId === leadAlloy.id

          return (
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Editar ${leadAlloy.code}`}
                onClick={() => onEdit(leadAlloy)}
                disabled={isDeleting}
                icon={Pencil}
              >
                <span className="sr-only sm:not-sr-only">Editar</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                aria-label={`Excluir ${leadAlloy.code}`}
                onClick={() => onDelete(leadAlloy)}
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
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase().trim()
      if (!search) {
        return true
      }

      const { code, description } = row.original

      return (
        code.toLowerCase().includes(search) ||
        (description?.toLowerCase().includes(search) ?? false)
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative max-w-sm flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              strokeWidth={1.5}
            />
            <Input
              placeholder="Buscar por código ou descrição..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
              aria-label="Buscar liga"
            />
          </div>

          <div className="w-full max-w-xs">
            <Select
              label="Filtrar por descrição"
              options={[...DESCRIPTION_FILTER_OPTIONS]}
              value={descriptionFilterValue}
              onChange={(event) =>
                table
                  .getColumn("description_filter")
                  ?.setFilterValue(event.target.value)
              }
              aria-label="Filtrar por descrição"
            />
          </div>
        </div>
      }
    >
      <table className="w-full min-w-[640px] text-left text-sm">
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
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-zinc-500"
              >
                Nenhuma liga encontrada com os filtros aplicados.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
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
            ))
          )}
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
