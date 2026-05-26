import { TrendingDown } from "lucide-react"

import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { SimpleBarChart } from "@/components/ui/simple-bar-chart"
import type { LossesDashboard } from "@/types/losses-dashboard"

export type LossesChartsProps = {
  dashboard: LossesDashboard
}

export function LossesCharts({ dashboard }: LossesChartsProps) {
  const hasData =
    dashboard.indicators.recordCounts.sandingScrap > 0 ||
    dashboard.indicators.recordCounts.pastingProduction > 0

  if (!hasData) {
    return (
      <EmptyState
        icon={TrendingDown}
        title="Sem perdas no período"
        description="Ajuste o filtro de datas ou registre apontamentos na lixação e empastadeira."
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card
        title="Comparativo lixação × empastadeira"
        description="Refugo, placas perdidas e placas empastadas no período."
      >
        <SimpleBarChart
          items={dashboard.moduleComparison}
          barClassName="bg-apple-red"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Taxa de perda diária"
        description="Placas perdidas sobre placas empastadas por dia."
      >
        <SimpleBarChart
          items={dashboard.lossRateByDay}
          barClassName="bg-amber-500"
          emptyMessage="Sem taxa calculável no período."
        />
      </Card>

      <Card
        title="Refugo diário (peso)"
        description="Soma diária de scrap_weight na lixação."
      >
        <SimpleBarChart
          items={dashboard.scrapWeightByDay}
          barClassName="bg-rose-500"
          emptyMessage="Sem refugo registrado no período."
        />
      </Card>

      <Card
        title="Placas perdidas por dia"
        description="Soma diária de plates_qty_lost na lixação."
      >
        <SimpleBarChart
          items={dashboard.platesLostByDay}
          barClassName="bg-orange-500"
          emptyMessage="Sem placas perdidas no período."
        />
      </Card>

      <Card
        title="Placas empastadas por dia"
        description="Soma diária de plates_qty na empastadeira."
        className="lg:col-span-2"
      >
        <SimpleBarChart
          items={dashboard.pastingPlatesByDay}
          barClassName="bg-blue-500"
          emptyMessage="Sem produção registrada no período."
        />
      </Card>
    </div>
  )
}
