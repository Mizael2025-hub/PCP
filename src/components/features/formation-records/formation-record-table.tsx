"use client"

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState
} from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDown, ChevronRight, Pencil, Search } from "lucide-react"
import { Fragment, useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TableContainer } from "@/components/ui/table-container"
import type { EmployeeWithSector } from "@/types/employee"
import type { FormationRecordWithRelations } from "@/types/formation-record"

import {
  FORMATION_STATUS_OPTIONS,
  FormationRecordStatusBadge
} from "./formation-record-status-badge"

export type FormationRecordTableProps = {
  data: FormationRecordWithRelations[]
  employees: EmployeeWithSector[]
  filters: {
    dateFrom: string
    dateTo: string
    status: string
    operatorId: string
  }
  onEdit: (record: FormationRecordWithRelations) => void
}

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const
const ALL_STATUSES_VALUE = "all"
const ALL_OPERATORS_VALUE = "all"

function formatDateTimeLabel(value: string): string {
  return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR })
}

function formatOptionalNumber(
  value: number | null,
  fractionDigits = 2
): string {
  if (value === null) {
    return "—"
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })
}

export function FormationRecordTable({
  data,
  employees,
  filters,
  onEdit
}: FormationRecordTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)
  const [status, setStatus] = useState(filters.status || ALL_STATUSES_VALUE)
  const [operatorId, setOperatorId] = useState(
    filters.operatorId || ALL_OPERATORS_VALUE
  )
  const [expanded, setExpanded] = useState<ExpandedState>({})

  useEffect(() => {
    setDateFrom(filters.dateFrom)
    setDateTo(filters.dateTo)
    setStatus(filters.status || ALL_STATUSES_VALUE)
    setOperatorId(filters.operatorId || ALL_OPERATORS_VALUE)
  }, [filters.dateFrom, filters.dateTo, filters.status, filters.operatorId])

  const statusFilterOptions = useMemo(
    () => [
      { value: ALL_STATUSES_VALUE, label: "Todos os status" },
      ...FORMATION_STATUS_OPTIONS
    ],
    []
  )

  const operatorFilterOptions = useMemo(
    () => [
      { value: ALL_OPERATORS_VALUE, label: "Todos os operadores" },
      ...employees.map((employee) => ({
        value: employee.id,
        label: employee.name
      }))
    ],
    [employees]
  )

  const columns = useMemo<ColumnDef<FormationRecordWithRelations>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <button
            type="button"
            className="apple-pressable rounded-ios-btn p-1 text-zinc-500"
            aria-label={
              row.getIsExpanded() ? "Recolher linhas" : "Expandir linhas"
            }
            onClick={row.getToggleExpandedHandler()}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        )
      },
      {
        accessorKey: "formation_lot_code",
        header: "Lote",
        cell: ({ getValue }) => (
          <span className="font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
            {getValue<string>()}
          </span>
        )
      },
      {
        accessorKey: "start_date",
        header: "Início",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatDateTimeLabel(getValue<string>())}
          </span>
        )
      },
      {
        accessorKey: "end_date",
        header: "Fim",
        cell: ({ getValue }) => {
          const value = getValue<string | null>()

          return (
            <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
              {value ? formatDateTimeLabel(value) : "—"}
            </span>
          )
        }
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
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <FormationRecordStatusBadge status={getValue<string>()} />
        )
      },
      {
        id: "lines_count",
        accessorFn: (row) => row.details.length,
        header: "Linhas",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
            {getValue<number>()}
          </span>
        )
      },
      {
        accessorKey: "created_at",
        header: "Registrado em",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-zinc-500">
            {formatDateTimeLabel(getValue<string>())}
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
              aria-label="Editar formação"
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
    state: { globalFilter, expanded },
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase().trim()
      if (!search) {
        return true
      }

      const record = row.original
      const searchable = [
        record.formation_lot_code,
        record.employees?.name,
        ...record.details.map((d) => d.battery_lot_code)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchable.includes(search)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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

    if (status && status !== ALL_STATUSES_VALUE) {
      params.set("status", status)
    }

    if (operatorId && operatorId !== ALL_OPERATORS_VALUE) {
      params.set("operatorId", operatorId)
    }

    const query = params.toString()

    startTransition(() => {
      router.push(
        query ? `/qualidade/formacao?${query}` : "/qualidade/formacao"
      )
    })
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/qualidade/formacao")
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
    (status !== ALL_STATUSES_VALUE ? status : "") !== filters.status ||
    (operatorId !== ALL_OPERATORS_VALUE ? operatorId : "") !==
      filters.operatorId

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
              label="Status"
              options={statusFilterOptions}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={isPending}
            />

            <Select
              label="Operador"
              options={operatorFilterOptions}
              value={operatorId}
              onChange={(event) => setOperatorId(event.target.value)}
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
              placeholder="Buscar por lote, operador, bateria..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
              aria-label="Buscar formação"
            />
          </div>
        </div>
      }
    >
      <table className="w-full min-w-[1000px] text-left text-sm">
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
                Carregando formações...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-zinc-500"
              >
                Nenhuma formação encontrada com os filtros aplicados.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <tr className="border-b border-zinc-100 transition-colors duration-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() ? (
                  <tr className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <td colSpan={columns.length} className="px-4 py-3">
                      {row.original.details.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                          Nenhuma linha de detalhe registrada.
                        </p>
                      ) : (
                        <table className="w-full min-w-[640px] text-left text-xs">
                          <thead>
                            <tr className="text-zinc-500">
                              <th className="pb-2 pr-4 font-medium">
                                Circuito
                              </th>
                              <th className="pb-2 pr-4 font-medium">
                                Lote bateria
                              </th>
                              <th className="pb-2 pr-4 font-medium">
                                V inicial
                              </th>
                              <th className="pb-2 pr-4 font-medium">V final</th>
                              <th className="pb-2 font-medium">Corrente (A)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.original.details.map((detail) => (
                              <tr
                                key={detail.id}
                                className="border-t border-zinc-200/80 dark:border-zinc-700"
                              >
                                <td className="py-2 pr-4 tabular-nums">
                                  {detail.circuit_number}
                                </td>
                                <td className="py-2 pr-4 tabular-nums">
                                  {detail.battery_lot_code}
                                </td>
                                <td className="py-2 pr-4 tabular-nums">
                                  {formatOptionalNumber(detail.initial_voltage)}
                                </td>
                                <td className="py-2 pr-4 tabular-nums">
                                  {formatOptionalNumber(detail.final_voltage)}
                                </td>
                                <td className="py-2 tabular-nums">
                                  {formatOptionalNumber(detail.current_ampere)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
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
