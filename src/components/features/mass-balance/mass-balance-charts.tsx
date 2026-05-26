import { Scale } from "lucide-react"

import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { SimpleBarChart } from "@/components/ui/simple-bar-chart"
import type { MassBalanceDashboard } from "@/types/mass-balance"

export type MassBalanceChartsProps = {
  dashboard: MassBalanceDashboard
}

export function MassBalanceCharts({ dashboard }: MassBalanceChartsProps) {
  const hasData =
    dashboard.indicators.leadInputKg > 0 ||
    dashboard.indicators.registeredOutputKg > 0

  if (!hasData) {
    return (
      <EmptyState
        icon={Scale}
        title="Sem dados para balanço"
        description="Registre consumo de chumbo, misturador, fundidora ou lixação no período filtrado."
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card
        title="Cruzamento por módulo"
        description="Comparativo de massa entre as quatro fontes rastreadas."
      >
        <SimpleBarChart
          items={dashboard.crossModuleTotals}
          barClassName="bg-blue-500"
          emptyMessage="Sem apontamentos no período."
        />
      </Card>

      <Card
        title="Distribuição das saídas"
        description="Como a massa de chumbo registrada se distribui nas saídas."
      >
        <SimpleBarChart
          items={dashboard.outputDistribution}
          barClassName="bg-emerald-500"
          emptyMessage="Sem saídas registradas no período."
        />
      </Card>

      <Card
        title="Entrada diária de chumbo"
        description="Soma diária de lead_consumption."
      >
        <SimpleBarChart
          items={dashboard.dailyLeadInput}
          barClassName="bg-indigo-500"
          emptyMessage="Sem consumo registrado no período."
        />
      </Card>

      <Card
        title="Saída registrada diária"
        description="Soma diária de misturador + fundidora + refugo."
      >
        <SimpleBarChart
          items={dashboard.dailyRegisteredOutput}
          barClassName="bg-amber-500"
          emptyMessage="Sem saídas registradas no período."
        />
      </Card>

      <Card
        title="Saldo diário de massa"
        description="Diferença diária entre entrada e saída registrada."
        className="lg:col-span-2"
      >
        <SimpleBarChart
          items={dashboard.dailyBalanceTrend}
          barClassName="bg-apple-red"
          emptyMessage="Sem variação registrada no período."
        />
      </Card>
    </div>
  )
}
