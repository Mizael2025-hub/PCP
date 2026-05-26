"use client"

import { Filter, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { ReportResolvedFilters } from "@/types/report"
import type { Shift } from "@/types/shift"
import type { Sector } from "@/types/sector"

export type ReportFiltersProps = {
  filters: ReportResolvedFilters
  shifts: Shift[]
  sectors: Sector[]
  basePath?: string
}

const ALL_SHIFTS_VALUE = "all"
const ALL_SECTORS_VALUE = "all"

export function ReportFilters({
  filters,
  shifts,
  sectors,
  basePath = "/relatorios"
}: ReportFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)
  const [shiftId, setShiftId] = useState(filters.shiftId || ALL_SHIFTS_VALUE)
  const [sectorId, setSectorId] = useState(
    filters.sectorId || ALL_SECTORS_VALUE
  )

  useEffect(() => {
    setDateFrom(filters.dateFrom)
    setDateTo(filters.dateTo)
    setShiftId(filters.shiftId || ALL_SHIFTS_VALUE)
    setSectorId(filters.sectorId || ALL_SECTORS_VALUE)
  }, [filters.dateFrom, filters.dateTo, filters.shiftId, filters.sectorId])

  const shiftOptions = useMemo(
    () => [
      { value: ALL_SHIFTS_VALUE, label: "Todos os turnos" },
      ...shifts.map((shift) => ({
        value: shift.id,
        label: shift.name
      }))
    ],
    [shifts]
  )

  const sectorOptions = useMemo(
    () => [
      { value: ALL_SECTORS_VALUE, label: "Todos os setores" },
      ...sectors.map((sector) => ({
        value: sector.id,
        label: sector.name
      }))
    ],
    [sectors]
  )

  const filtersChanged =
    dateFrom !== filters.dateFrom ||
    dateTo !== filters.dateTo ||
    (shiftId !== ALL_SHIFTS_VALUE ? shiftId : "") !== filters.shiftId ||
    (sectorId !== ALL_SECTORS_VALUE ? sectorId : "") !== filters.sectorId

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

    if (sectorId && sectorId !== ALL_SECTORS_VALUE) {
      params.set("sectorId", sectorId)
    }

    const query = params.toString()

    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath)
    })
  }

  function clearFilters() {
    startTransition(() => {
      router.push(basePath)
    })
  }

  return (
    <Card
      title="Filtros globais"
      description="Período, turno e setor aplicados a todos os indicadores abaixo."
      className={isPending ? "opacity-60 transition-opacity" : undefined}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Input
          label="Data inicial"
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          disabled={isPending}
        />

        <Input
          label="Data final"
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          disabled={isPending}
        />

        <Select
          label="Turno"
          value={shiftId}
          onChange={(event) => setShiftId(event.target.value)}
          options={shiftOptions}
          disabled={isPending}
        />

        <Select
          label="Setor"
          value={sectorId}
          onChange={(event) => setSectorId(event.target.value)}
          options={sectorOptions}
          disabled={isPending}
        />

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <Button
            type="button"
            onClick={applyFilters}
            icon={Filter}
            disabled={isPending || !filtersChanged}
            className="w-full"
          >
            Aplicar
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={clearFilters}
            icon={RotateCcw}
            disabled={isPending}
            aria-label="Limpar filtros"
          />
        </div>
      </div>
    </Card>
  )
}
