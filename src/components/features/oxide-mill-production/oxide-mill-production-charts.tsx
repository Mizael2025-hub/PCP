"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo } from "react"

import { Card } from "@/components/ui/card"
import { SimpleBarChart } from "@/components/ui/simple-bar-chart"
import type {
  OxideMillDailySummary,
  OxideMillProductionWithRelations
} from "@/types/oxide-mill-production"

export type OxideMillProductionChartsProps = {
  records: OxideMillProductionWithRelations[]
  dailySummary: OxideMillDailySummary[]
}

function formatWeight(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })} kg`
}

function formatDegree(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`
}

function formatDateLabel(value: string): string {
  return format(parseISO(value), "dd/MM", { locale: ptBR })
}

export function OxideMillProductionCharts({
  records,
  dailySummary
}: OxideMillProductionChartsProps) {
  const weightChartItems = useMemo(
    () =>
      dailySummary.map((day) => ({
        label: formatDateLabel(day.date),
        value: day.totalOxideWeight,
        displayValue: formatWeight(day.totalOxideWeight)
      })),
    [dailySummary]
  )

  const degreeChartItems = useMemo(
    () =>
      dailySummary.map((day) => ({
        label: formatDateLabel(day.date),
        value: day.averageOxidationDegree,
        displayValue: formatDegree(day.averageOxidationDegree)
      })),
    [dailySummary]
  )

  const totals = useMemo(() => {
    if (records.length === 0) {
      return { totalWeight: 0, averageDegree: 0 }
    }

    const totalWeight = records.reduce(
      (sum, record) => sum + record.oxide_weight,
      0
    )
    const averageDegree =
      records.reduce((sum, record) => sum + record.oxidation_degree, 0) /
      records.length

    return { totalWeight, averageDegree }
  }, [records])

  if (records.length === 0) {
    return null
  }

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      <Card
        title="Peso de óxido por dia"
        description="Soma diária no período filtrado."
        className="lg:col-span-1"
      >
        <SimpleBarChart
          items={weightChartItems}
          barClassName="bg-blue-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Grau de oxidação médio"
        description="Média diária (%) no período filtrado."
        className="lg:col-span-1"
      >
        <SimpleBarChart
          items={degreeChartItems}
          barClassName="bg-amber-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Resumo do período"
        description={`${records.length} apontamento(s) no filtro atual.`}
        className="lg:col-span-1"
      >
        <dl className="grid gap-4">
          <div>
            <dt className="text-sm text-zinc-500">Peso total de óxido</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {formatWeight(totals.totalWeight)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Grau médio de oxidação</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {formatDegree(totals.averageDegree)}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
