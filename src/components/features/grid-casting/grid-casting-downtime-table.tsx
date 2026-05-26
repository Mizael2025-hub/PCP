"use client"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pencil, Search } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TableContainer } from "@/components/ui/table-container"
import { formatDurationLabel } from "@/lib/utils/datetime"
import type { GridCastingProductionWithRelations } from "@/types/grid-casting"
import type { GridCastingDowntimeWithProduction } from "@/types/grid-casting-downtime"
import type { Shift } from "@/types/shift"

export type GridCastingDowntimeTableProps = {
  data: GridCastingDowntimeWithProduction[]
  productions: GridCastingProductionWithRelations[]
  shifts: Shift[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
    productionId: string
  }
  onEdit: (record: GridCastingDowntimeWithProduction) => void
}

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const
const ALL_SHIFTS_VALUE = "all"
const ALL_PRODUCTIONS_VALUE = "all"

function formatDateLabel(value: string): string {
  return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR })
}

function formatDateTimeLabel(value: string): string {
  return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR })
}

export function GridCastingDowntimeTable({
  data,
  productions,
  shifts,
  filters,
  onEdit
}: GridCastingDowntimeTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)
  const [shiftId, setShiftId] = useState(filters.shiftId || ALL_SHIFTS_VALUE)
  const [productionId, setProductionId] = useState(
    filters.productionId || ALL_PRODUCTIONS_VALUE
  )

  useEffect(() => {
    setDateFrom(filters.dateFrom)
    setDateTo(filters.dateTo)
    setShiftId(filters.shiftId || ALL_SHIFTS_VALUE)
    setProductionId(filters.productionId || ALL_PRODUCTIONS_VALUE)
  }, [filters.dateFrom, filters.dateTo, filters.shiftId, filters.productionId])

  const shiftFilterOptions = useMemo(
    () => [
      { value: ALL_SHIFTS_VALUE, label: "Todos os turnos" },
      ...shifts.map((shift) => ({
        value: shift.id,
        label: shift.name
      }))
    ],
    [shifts]
  )

  const productionFilterOptions = useMemo(
    () => [
      { value: ALL_PRODUCTIONS_VALUE, label: "Todos os apontamentos" },
      ...productions.map((production) => {
        const date = production.date.split("-").reverse().join("/")
        const shift = production.shifts?.name ?? "—"
        const machine = production.machines?.name ?? "—"

        return {
          value: production.id,
          label: `${date} · ${shift} · ${machine}`
        }
      })
    ],
    [productions]
  )

  const columns = useMemo<ColumnDef<GridCastingDowntimeWithProduction>[]>(
    () => [
      {
        id: "production_date",
        accessorFn: (row) => row.production?.date ?? "",
        header: "Data apont.",
        cell: ({ row }) => {
          const date = row.original.production?.date

          return (
            <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
              {date ? formatDateLabel(date) : "—"}
            </span>
          )
        }
      },
      {
        id: "shift",
        accessorFn: (row) => row.production?.shifts?.name ?? "",
        header: "Turno",
        cell: ({ row }) => (
          <span className="text-zinc-600 dark:text-zinc-400">
            {row.original.production?.shifts?.name ?? "—"}
          </span>
        )
      },
      {
        id: "machine",
        accessorFn: (row) => row.production?.machines?.name ?? "",
        header: "Máquina",
        cell: ({ row }) => (
          <span className="text-zinc-600 dark:text-zinc-400">
            {row.original.production?.machines?.name ?? "—"}
          </span>
        )
      },
      {
        accessorKey: "reason",
        header: "Motivo",
        cell: ({ getValue }) => (
          <span className="max-w-[200px] truncate text-zinc-700 dark:text-zinc-300">
            {getValue<string>()}
          </span>
        )
      },
      {
        accessorKey: "start_time",
        header: "Início",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
            {formatDateTimeLabel(getValue<string>())}
          </span>
        )
      },
      {
        accessorKey: "end_time",
        header: "Fim",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
            {formatDateTimeLabel(getValue<string>())}
          </span>
        )
      },
      {
        accessorKey: "duration_minutes",
        header: "Duração",
        cell: ({ getValue }) => (
          <span className="font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatDurationLabel(getValue<number>())}
          </span>
        )
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Editar parada"
              onClick={() => onEdit(row.original)}
              icon={Pencil}
            >
              <span className="sr-only sm:not-sr-only">Editar</span>
            </Button>
          </div>
        )
      }
    ],
    [onEdit]
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

      const record = row.original
      const searchable = [
        record.reason,
        record.production?.shifts?.name,
        record.production?.machines?.name,
        record.production?.employees?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchable.includes(search)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  })

  function buildQueryParams(): string {
    const params = new URLSearchParams()
    params.set("tab", "paradas")

    if (dateFrom) {
      params.set("dateFrom", dateFrom)
    }

    if (dateTo) {
      params.set("dateTo", dateTo)
    }

    if (shiftId && shiftId !== ALL_SHIFTS_VALUE) {
      params.set("shiftId", shiftId)
    }

    if (productionId && productionId !== ALL_PRODUCTIONS_VALUE) {
      params.set("productionId", productionId)
    }

    return params.toString()
  }

  function applyFilters() {
    const query = buildQueryParams()

    startTransition(() => {
      router.push(
        query
          ? `/producao/grid-casting?${query}`
          : "/producao/grid-casting?tab=paradas"
      )
    })
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/producao/grid-casting?tab=paradas")
    })
  }

  const filteredCount = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount)

  const filtersChanged =
    dateFrom !== filters.dateFrom ||
    dateTo !== filters.dateTo ||
    (shiftId !== ALL_SHIFTS_VALUE ? shiftId : "") !== filters.shiftId ||
    (productionId !== ALL_PRODUCTIONS_VALUE ? productionId : "") !==
      filters.productionId

  return (
    <TableContainer
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              label="Data inicial"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              disabled={isPending}
              className="tabular-nums"
            />

            <Input
              label="Data final"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              disabled={isPending}
              className="tabular-nums"
            />

            <Select
              label="Turno"
              options={shiftFilterOptions}
              value={shiftId}
              onChange={(event) => setShiftId(event.target.value)}
              disabled={isPending}
            />

            <Select
              label="Apontamento"
              options={productionFilterOptions}
              value={productionId}
              onChange={(event) => setProductionId(event.target.value)}
              disabled={isPending}
            />

            <div className="flex items-end gap-2">
              <Button
                type="button"
                onClick={applyFilters}
                isLoading={isPending}
                disabled={!filtersChanged && !isPending}
                className="flex-1"
              >
                Filtrar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={clearFilters}
                disabled={isPending}
              >
                Limpar
              </Button>
            </div>
          </div>

          <div className="relative max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              strokeWidth={1.5}
            />
            <Input
              placeholder="Buscar por motivo, máquina ou operador..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
              aria-label="Buscar parada"
            />
          </div>
        </div>
      }
    >
      <table className="w-full min-w-[1024px] text-left text-sm">
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
          {isPending ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-zinc-500"
              >
                Carregando paradas...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-zinc-500"
              >
                Nenhuma parada encontrada com os filtros aplicados.
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
