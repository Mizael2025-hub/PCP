import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BarChart3 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { SimpleBarChart } from "@/components/ui/simple-bar-chart"
import { formatReportWeight } from "@/lib/utils/report-format"
import type { ReportDashboard } from "@/types/report"

export type ReportChartsProps = {
  dashboard: ReportDashboard
}

function formatDateLabel(value: string): string {
  return format(parseISO(value), "dd/MM", { locale: ptBR })
}

export function ReportCharts({ dashboard }: ReportChartsProps) {
  const hasData = dashboard.moduleSummaries.some(
    (module) => module.recordCount > 0
  )

  if (!hasData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Sem dados no período"
        description="Ajuste os filtros globais ou registre apontamentos nos módulos de produção."
      />
    )
  }

  const dailyWeightItems = dashboard.dailyTrend.slice(-14).map((day) => ({
    label: formatDateLabel(day.date),
    value: day.totalWeightKg,
    displayValue: formatReportWeight(day.totalWeightKg)
  }))

  const dailyUnitsItems = dashboard.dailyTrend.slice(-14).map((day) => ({
    label: formatDateLabel(day.date),
    value: day.producedUnits,
    displayValue: day.producedUnits.toLocaleString("pt-BR")
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-2">
      <Card
        title="Produção diária (peso)"
        description="Soma de pesos registrados por dia no período."
      >
        <SimpleBarChart
          items={dailyWeightItems}
          barClassName="bg-blue-500"
          emptyMessage="Sem produção registrada no período."
        />
      </Card>

      <Card
        title="Produção diária (unidades)"
        description="Grades, placas e baterias produzidas por dia."
      >
        <SimpleBarChart
          items={dailyUnitsItems}
          barClassName="bg-emerald-500"
          emptyMessage="Sem unidades registradas no período."
        />
      </Card>

      <Card
        title="Produção por módulo"
        description="Comparativo de volume principal entre módulos."
      >
        <SimpleBarChart
          items={dashboard.productionByModule}
          barClassName="bg-indigo-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Qualidade laboratorial"
        description={`${dashboard.qualitySummary.totalSamples} amostra(s) analisada(s).`}
      >
        <SimpleBarChart
          items={dashboard.qualityChart}
          barClassName="bg-amber-500"
          emptyMessage="Sem amostras no período."
        />
      </Card>

      <Card
        title="Refugo diário"
        description="Peso de refugo registrado na lixação."
        className="lg:col-span-2"
      >
        <SimpleBarChart
          items={dashboard.scrapByDay}
          barClassName="bg-apple-red"
          emptyMessage="Sem refugo registrado no período."
        />
      </Card>
    </div>
  )
}
