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
import type { MixerProductionWithRelations } from "@/types/mixer-production"
import type { Shift } from "@/types/shift"

export type MixerProductionTableProps = {
  data: MixerProductionWithRelations[]
  shifts: Shift[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
    batchNumber: string
  }
  onEdit: (record: MixerProductionWithRelations) => void
}

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const
const ALL_SHIFTS_VALUE = "all"
const ALL_BATCHES_VALUE = "all"

function formatWeight(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })
}

function formatVolume(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatDensity(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })
}

function formatDateLabel(value: string): string {
  return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR })
}

export function MixerProductionTable({
  data,
  shifts,
  filters,
  onEdit
}: MixerProductionTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)
  const [shiftId, setShiftId] = useState(filters.shiftId || ALL_SHIFTS_VALUE)
  const [batchNumber, setBatchNumber] = useState(
    filters.batchNumber || ALL_BATCHES_VALUE
  )

  useEffect(() => {
    setDateFrom(filters.dateFrom)
    setDateTo(filters.dateTo)
    setShiftId(filters.shiftId || ALL_SHIFTS_VALUE)
    setBatchNumber(filters.batchNumber || ALL_BATCHES_VALUE)
  }, [filters.dateFrom, filters.dateTo, filters.shiftId, filters.batchNumber])

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

  const batchFilterOptions = useMemo(() => {
    const batches = new Set(data.map((record) => record.batch_number))
    const sorted = Array.from(batches).sort((a, b) => a.localeCompare(b))

    return [
      { value: ALL_BATCHES_VALUE, label: "Todas as bateladas" },
      ...sorted.map((batch) => ({
        value: batch,
        label: batch
      }))
    ]
  }, [data])

  const columns = useMemo<ColumnDef<MixerProductionWithRelations>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Data",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatDateLabel(getValue<string>())}
          </span>
        )
      },
      {
        id: "shift",
        accessorFn: (row) => row.shifts?.name ?? "",
        header: "Turno",
        cell: ({ row }) => (
          <span className="text-zinc-600 dark:text-zinc-400">
            {row.original.shifts?.name ?? "—"}
          </span>
        )
      },
      {
        accessorKey: "batch_number",
        header: "Batelada",
        cell: ({ getValue }) => (
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {getValue<string>()}
          </span>
        )
      },
      {
        id: "operator",
        accessorFn: (row) => row.employees?.name ?? "",
        header: "Operador",
        cell: ({ row }) => (
          <span className="text-zinc-600 dark:text-zinc-400">
            {row.original.employees?.name ?? "—"}
          </span>
        )
      },
      {
        accessorKey: "lead_ball_weight",
        header: "Bola (kg)",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatWeight(getValue<number>())}
          </span>
        )
      },
      {
        accessorKey: "oxide_weight",
        header: "Óxido (kg)",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatWeight(getValue<number>())}
          </span>
        )
      },
      {
        accessorKey: "water_volume",
        header: "Água (L)",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatVolume(getValue<number>())}
          </span>
        )
      },
      {
        accessorKey: "acid_volume",
        header: "Ácido (L)",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatVolume(getValue<number>())}
          </span>
        )
      },
      {
        accessorKey: "density",
        header: "Densidade",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatDensity(getValue<number>())}
          </span>
        )
      },
      {
        accessorKey: "created_at",
        header: "Registrado em",
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
          const record = row.original

          return (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Editar apontamento"
                onClick={() => onEdit(record)}
                icon={Pencil}
              >
                <span className="sr-only sm:not-sr-only">Editar</span>
              </Button>
            </div>
          )
        }
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
        record.shifts?.name,
        record.employees?.name,
        record.batch_number
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

  function applyFilters() {
    const params = new URLSearchParams()

    if (dateFrom) {
      params.set("dateFrom", dateFrom)
    }

    if (dateTo) {
      params.set("dateTo", dateTo)
    }

    if (shiftId && shiftId !== ALL_SHIFTS_VALUE) {
      params.set("shiftId", shiftId)
    }

    if (batchNumber && batchNumber !== ALL_BATCHES_VALUE) {
      params.set("batchNumber", batchNumber)
    }

    const query = params.toString()

    startTransition(() => {
      router.push(query ? `/producao/mixer?${query}` : "/producao/mixer")
    })
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/producao/mixer")
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
    (batchNumber !== ALL_BATCHES_VALUE ? batchNumber : "") !==
      filters.batchNumber

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
              label="Batelada"
              options={batchFilterOptions}
              value={batchNumber}
              onChange={(event) => setBatchNumber(event.target.value)}
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
              placeholder="Buscar por batelada, operador ou turno..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
              aria-label="Buscar apontamento"
            />
          </div>
        </div>
      }
    >
      <table className="w-full min-w-[1100px] text-left text-sm">
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
                Carregando apontamentos...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-zinc-500"
              >
                Nenhum apontamento encontrado com os filtros aplicados.
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
