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
import type { LeadAlloy } from "@/types/lead-alloy"
import type { LeadConsumptionWithRelations } from "@/types/lead-consumption"
import type { Sector } from "@/types/sector"

export type LeadConsumptionTableProps = {
  data: LeadConsumptionWithRelations[]
  alloys: LeadAlloy[]
  sectors: Sector[]
  filters: {
    dateFrom: string
    dateTo: string
    alloyId: string
    destinationSectorId: string
  }
  onEdit: (record: LeadConsumptionWithRelations) => void
}

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const
const ALL_ALLOYS_VALUE = "all"
const ALL_SECTORS_VALUE = "all"

function formatWeight(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })
}

function formatDateLabel(value: string): string {
  return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR })
}

function formatAlloyLabel(code: string, description: string | null): string {
  return description ? `${code} — ${description}` : code
}

export function LeadConsumptionTable({
  data,
  alloys,
  sectors,
  filters,
  onEdit
}: LeadConsumptionTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)
  const [alloyId, setAlloyId] = useState(filters.alloyId || ALL_ALLOYS_VALUE)
  const [destinationSectorId, setDestinationSectorId] = useState(
    filters.destinationSectorId || ALL_SECTORS_VALUE
  )

  useEffect(() => {
    setDateFrom(filters.dateFrom)
    setDateTo(filters.dateTo)
    setAlloyId(filters.alloyId || ALL_ALLOYS_VALUE)
    setDestinationSectorId(filters.destinationSectorId || ALL_SECTORS_VALUE)
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.alloyId,
    filters.destinationSectorId
  ])

  const alloyFilterOptions = useMemo(
    () => [
      { value: ALL_ALLOYS_VALUE, label: "Todas as ligas" },
      ...alloys.map((alloy) => ({
        value: alloy.id,
        label: formatAlloyLabel(alloy.code, alloy.description)
      }))
    ],
    [alloys]
  )

  const sectorFilterOptions = useMemo(
    () => [
      { value: ALL_SECTORS_VALUE, label: "Todos os setores" },
      ...sectors.map((sector) => ({
        value: sector.id,
        label: sector.name
      }))
    ],
    [sectors]
  )

  const columns = useMemo<ColumnDef<LeadConsumptionWithRelations>[]>(
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
        id: "alloy",
        accessorFn: (row) => row.lead_alloys?.code ?? "",
        header: "Liga",
        cell: ({ row }) => {
          const alloy = row.original.lead_alloys

          return (
            <span className="text-zinc-700 dark:text-zinc-300">
              {alloy ? formatAlloyLabel(alloy.code, alloy.description) : "—"}
            </span>
          )
        }
      },
      {
        id: "sector",
        accessorFn: (row) => row.sectors?.name ?? "",
        header: "Setor destino",
        cell: ({ row }) => (
          <span className="text-zinc-600 dark:text-zinc-400">
            {row.original.sectors?.name ?? "—"}
          </span>
        )
      },
      {
        accessorKey: "weight_consumed",
        header: "Peso (kg)",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatWeight(getValue<number>())}
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
        record.lead_alloys?.code,
        record.lead_alloys?.description,
        record.sectors?.name
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

    if (alloyId && alloyId !== ALL_ALLOYS_VALUE) {
      params.set("alloyId", alloyId)
    }

    if (destinationSectorId && destinationSectorId !== ALL_SECTORS_VALUE) {
      params.set("destinationSectorId", destinationSectorId)
    }

    const query = params.toString()

    startTransition(() => {
      router.push(
        query
          ? `/producao/lead-consumption?${query}`
          : "/producao/lead-consumption"
      )
    })
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/producao/lead-consumption")
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
    (alloyId !== ALL_ALLOYS_VALUE ? alloyId : "") !== filters.alloyId ||
    (destinationSectorId !== ALL_SECTORS_VALUE ? destinationSectorId : "") !==
      filters.destinationSectorId

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
              label="Liga"
              options={alloyFilterOptions}
              value={alloyId}
              onChange={(event) => setAlloyId(event.target.value)}
              disabled={isPending}
            />

            <Select
              label="Setor destino"
              options={sectorFilterOptions}
              value={destinationSectorId}
              onChange={(event) => setDestinationSectorId(event.target.value)}
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
              placeholder="Buscar por liga ou setor..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
              aria-label="Buscar apontamento"
            />
          </div>
        </div>
      }
    >
      <table className="w-full min-w-[800px] text-left text-sm">
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
