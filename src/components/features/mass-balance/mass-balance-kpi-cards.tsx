import {
  ArrowDownUp,
  Blend,
  Grid3X3,
  Package,
  Scale,
  Trash2
} from "lucide-react"

import { Card } from "@/components/ui/card"
import {
  formatReportInteger,
  formatReportPercent,
  formatReportWeight
} from "@/lib/utils/report-format"
import type { MassBalanceIndicators } from "@/types/mass-balance"

export type MassBalanceKpiCardsProps = {
  indicators: MassBalanceIndicators
}

const KPI_ITEMS = [
  {
    key: "leadInputKg",
    label: "Entrada de chumbo",
    icon: Package,
    format: formatReportWeight,
    hint: "lead_consumption"
  },
  {
    key: "registeredOutputKg",
    label: "Saída registrada",
    icon: Scale,
    format: formatReportWeight,
    hint: "mixer + fundidora + refugo"
  },
  {
    key: "balanceKg",
    label: "Saldo de massa",
    icon: ArrowDownUp,
    format: formatReportWeight,
    hint: "entrada − saída"
  },
  {
    key: "balancePercent",
    label: "Desvio",
    icon: ArrowDownUp,
    format: formatReportPercent,
    hint: "sobre a entrada"
  },
  {
    key: "yieldPercent",
    label: "Rendimento fundidora",
    icon: Grid3X3,
    format: formatReportPercent,
    hint: "grid_casting / entrada"
  },
  {
    key: "scrapRatePercent",
    label: "Taxa de refugo",
    icon: Trash2,
    format: formatReportPercent,
    hint: "sanding_scrap / entrada"
  }
] as const

export function MassBalanceKpiCards({ indicators }: MassBalanceKpiCardsProps) {
  const totalRecords =
    indicators.recordCounts.leadConsumption +
    indicators.recordCounts.mixer +
    indicators.recordCounts.gridCasting +
    indicators.recordCounts.sandingScrap

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {KPI_ITEMS.map((item) => {
          const Icon = item.icon
          const value = indicators[item.key]

          return (
            <Card key={item.key} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {item.format(value)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">{item.hint}</p>
                </div>
                <div className="rounded-ios-btn bg-blue-500/10 p-2 text-blue-500">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card
        title="Cruzamento de registros"
        description={`${formatReportInteger(totalRecords)} apontamento(s) considerados no período.`}
      >
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-zinc-500">Consumo de chumbo</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatReportInteger(indicators.recordCounts.leadConsumption)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-sm text-zinc-500">
              <Blend className="h-4 w-4" strokeWidth={1.5} />
              Misturador
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatReportInteger(indicators.recordCounts.mixer)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-sm text-zinc-500">
              <Grid3X3 className="h-4 w-4" strokeWidth={1.5} />
              Fundidora
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatReportInteger(indicators.recordCounts.gridCasting)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-sm text-zinc-500">
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Lixação
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatReportInteger(indicators.recordCounts.sandingScrap)}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
