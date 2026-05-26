"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo } from "react"

import { Card } from "@/components/ui/card"
import { SimpleBarChart } from "@/components/ui/simple-bar-chart"
import type {
  SandingScrapDailySummary,
  SandingScrapOperatorSummary,
  SandingScrapWithRelations
} from "@/types/sanding-scrap"

export type SandingScrapChartsProps = {
  records: SandingScrapWithRelations[]
  dailySummary: SandingScrapDailySummary[]
  operatorSummary: SandingScrapOperatorSummary[]
}

function formatWeight(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })} kg`
}

function formatQty(value: number): string {
  return value.toLocaleString("pt-BR")
}

function formatDateLabel(value: string): string {
  return format(parseISO(value), "dd/MM", { locale: ptBR })
}

export function SandingScrapCharts({
  records,
  dailySummary,
  operatorSummary
}: SandingScrapChartsProps) {
  const weightChartItems = useMemo(
    () =>
      dailySummary.map((day) => ({
        label: formatDateLabel(day.date),
        value: day.totalScrapWeight,
        displayValue: formatWeight(day.totalScrapWeight)
      })),
    [dailySummary]
  )

  const platesChartItems = useMemo(
    () =>
      dailySummary.map((day) => ({
        label: formatDateLabel(day.date),
        value: day.totalPlatesLost,
        displayValue: formatQty(day.totalPlatesLost)
      })),
    [dailySummary]
  )

  const operatorChartItems = useMemo(
    () =>
      operatorSummary.map((item) => ({
        label: item.label,
        value: item.totalScrapWeight,
        displayValue: formatWeight(item.totalScrapWeight)
      })),
    [operatorSummary]
  )

  const totals = useMemo(() => {
    if (records.length === 0) {
      return { totalWeight: 0, totalPlates: 0 }
    }

    return {
      totalWeight: records.reduce(
        (sum, record) => sum + record.scrap_weight,
        0
      ),
      totalPlates: records.reduce(
        (sum, record) => sum + record.plates_qty_lost,
        0
      )
    }
  }, [records])

  if (records.length === 0) {
    return null
  }

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Refugo por dia"
        description="Soma diária de peso no período filtrado."
      >
        <SimpleBarChart
          items={weightChartItems}
          barClassName="bg-rose-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Placas perdidas por dia"
        description="Soma diária de placas no período filtrado."
      >
        <SimpleBarChart
          items={platesChartItems}
          barClassName="bg-amber-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Refugo por operador"
        description="Peso total por operador no período."
      >
        <SimpleBarChart
          items={operatorChartItems}
          barClassName="bg-violet-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Resumo do período"
        description={`${records.length} apontamento(s) no filtro atual.`}
      >
        <dl className="grid gap-4">
          <div>
            <dt className="text-sm text-zinc-500">Peso total de refugo</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {formatWeight(totals.totalWeight)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Placas perdidas</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {formatQty(totals.totalPlates)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Operadores distintos</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {operatorSummary.length}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
