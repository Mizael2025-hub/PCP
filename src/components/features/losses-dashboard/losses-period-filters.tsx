"use client"

import { Filter, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { LossesResolvedFilters } from "@/types/losses-dashboard"

export type LossesPeriodFiltersProps = {
  filters: LossesResolvedFilters
  basePath?: string
}

export function LossesPeriodFilters({
  filters,
  basePath = "/relatorios/perdas"
}: LossesPeriodFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)

  useEffect(() => {
    setDateFrom(filters.dateFrom)
    setDateTo(filters.dateTo)
  }, [filters.dateFrom, filters.dateTo])

  const filtersChanged =
    dateFrom !== filters.dateFrom || dateTo !== filters.dateTo

  function applyFilters() {
    const params = new URLSearchParams()

    if (dateFrom) {
      params.set("dateFrom", dateFrom)
    }

    if (dateTo) {
      params.set("dateTo", dateTo)
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
      title="Filtros por período"
      description="Intervalo aplicado aos apontamentos de lixação e empastadeira."
      className={isPending ? "opacity-60 transition-opacity" : undefined}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="flex items-end gap-2 sm:col-span-2">
          <Button
            type="button"
            onClick={applyFilters}
            icon={Filter}
            disabled={isPending || !filtersChanged}
            className="w-full sm:w-auto"
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
