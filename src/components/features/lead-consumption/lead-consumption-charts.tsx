"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo } from "react"

import { Card } from "@/components/ui/card"
import { SimpleBarChart } from "@/components/ui/simple-bar-chart"
import type {
  LeadConsumptionDailySummary,
  LeadConsumptionGroupSummary,
  LeadConsumptionWithRelations
} from "@/types/lead-consumption"

export type LeadConsumptionChartsProps = {
  records: LeadConsumptionWithRelations[]
  dailySummary: LeadConsumptionDailySummary[]
  alloySummary: LeadConsumptionGroupSummary[]
  sectorSummary: LeadConsumptionGroupSummary[]
}

function formatWeight(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })} kg`
}

function formatDateLabel(value: string): string {
  return format(parseISO(value), "dd/MM", { locale: ptBR })
}

export function LeadConsumptionCharts({
  records,
  dailySummary,
  alloySummary,
  sectorSummary
}: LeadConsumptionChartsProps) {
  const dailyChartItems = useMemo(
    () =>
      dailySummary.map((day) => ({
        label: formatDateLabel(day.date),
        value: day.totalWeight,
        displayValue: formatWeight(day.totalWeight)
      })),
    [dailySummary]
  )

  const alloyChartItems = useMemo(
    () =>
      alloySummary.map((item) => ({
        label: item.label,
        value: item.totalWeight,
        displayValue: formatWeight(item.totalWeight)
      })),
    [alloySummary]
  )

  const sectorChartItems = useMemo(
    () =>
      sectorSummary.map((item) => ({
        label: item.label,
        value: item.totalWeight,
        displayValue: formatWeight(item.totalWeight)
      })),
    [sectorSummary]
  )

  const totalWeight = useMemo(
    () => records.reduce((sum, record) => sum + record.weight_consumed, 0),
    [records]
  )

  if (records.length === 0) {
    return null
  }

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Consumo por dia"
        description="Soma diária no período filtrado."
      >
        <SimpleBarChart
          items={dailyChartItems}
          barClassName="bg-blue-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card title="Consumo por liga" description="Total por liga de chumbo.">
        <SimpleBarChart
          items={alloyChartItems}
          barClassName="bg-amber-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card title="Consumo por setor" description="Total por setor de destino.">
        <SimpleBarChart
          items={sectorChartItems}
          barClassName="bg-emerald-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Resumo do período"
        description={`${records.length} apontamento(s) no filtro atual.`}
      >
        <dl className="grid gap-4">
          <div>
            <dt className="text-sm text-zinc-500">Peso total consumido</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {formatWeight(totalWeight)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Ligas distintas</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {alloySummary.length}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Setores atendidos</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {sectorSummary.length}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
