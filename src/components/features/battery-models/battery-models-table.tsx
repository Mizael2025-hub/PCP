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
import type { BatteryModel } from "@/types/battery-model"

export type BatteryModelsTableProps = {
  data: BatteryModel[]
  onEdit: (batteryModel: BatteryModel) => void
  onDelete: (batteryModel: BatteryModel) => void
  deletingId?: string | null
}

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const
const ALL_WEIGHT_RANGES = "all"

const WEIGHT_RANGE_OPTIONS = [
  { value: ALL_WEIGHT_RANGES, label: "Todas as faixas" },
  { value: "up_to_5", label: "Até 5,000 kg" },
  { value: "5_to_15", label: "De 5,001 a 15,000 kg" },
  { value: "above_15", label: "Acima de 15,000 kg" }
] as const

function formatWeight(weight: number): string {
  return weight.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })
}

function matchesWeightRange(weight: number, range: string): boolean {
  switch (range) {
    case "up_to_5":
      return weight <= 5
    case "5_to_15":
      return weight > 5 && weight <= 15
    case "above_15":
      return weight > 15
    default:
      return true
  }
}

export function BatteryModelsTable({
  data,
  onEdit,
  onDelete,
  deletingId = null
}: BatteryModelsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: "weight_range", value: ALL_WEIGHT_RANGES }
  ])

  const weightRangeValue =
    (columnFilters.find((filter) => filter.id === "weight_range")?.value as
      | string
      | undefined) ?? ALL_WEIGHT_RANGES

  const columns = useMemo<ColumnDef<BatteryModel>[]>(
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
        accessorKey: "name",
        header: "Nome",
        cell: ({ getValue }) => (
          <span className="text-zinc-700 dark:text-zinc-300">
            {getValue<string>()}
          </span>
        )
      },
      {
        accessorKey: "weight_specification",
        header: "Peso nominal (kg)",
        id: "weight_range",
        filterFn: (row, _columnId, filterValue) => {
          const range = String(filterValue)
          if (!range || range === ALL_WEIGHT_RANGES) {
            return true
          }
          return matchesWeightRange(row.original.weight_specification, range)
        },
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatWeight(getValue<number>())}
          </span>
        )
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
          const batteryModel = row.original
          const isDeleting = deletingId === batteryModel.id

          return (
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Editar ${batteryModel.name}`}
                onClick={() => onEdit(batteryModel)}
                disabled={isDeleting}
                icon={Pencil}
              >
                <span className="sr-only sm:not-sr-only">Editar</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                aria-label={`Excluir ${batteryModel.name}`}
                onClick={() => onDelete(batteryModel)}
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

      const { code, name, weight_specification: weight } = row.original

      return (
        code.toLowerCase().includes(search) ||
        name.toLowerCase().includes(search) ||
        formatWeight(weight).includes(search)
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
              placeholder="Buscar por código, nome ou peso..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
              aria-label="Buscar modelo de bateria"
            />
          </div>

          <div className="w-full max-w-xs">
            <Select
              label="Filtrar por faixa de peso"
              options={[...WEIGHT_RANGE_OPTIONS]}
              value={weightRangeValue}
              onChange={(event) =>
                table
                  .getColumn("weight_range")
                  ?.setFilterValue(event.target.value)
              }
              aria-label="Filtrar por faixa de peso"
            />
          </div>
        </div>
      }
    >
      <table className="w-full min-w-[720px] text-left text-sm">
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
                Nenhum modelo encontrado com os filtros aplicados.
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
