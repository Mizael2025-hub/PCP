import { Layers, Percent, Scale, Trash2, TrendingDown } from "lucide-react"

import { Card } from "@/components/ui/card"
import {
  formatReportInteger,
  formatReportPercent,
  formatReportWeight
} from "@/lib/utils/report-format"
import type { LossesIndicators } from "@/types/losses-dashboard"

export type LossesKpiCardsProps = {
  indicators: LossesIndicators
}

const KPI_ITEMS = [
  {
    key: "scrapWeightKg",
    label: "Refugo total (lixação)",
    icon: Trash2,
    format: formatReportWeight
  },
  {
    key: "platesLost",
    label: "Placas perdidas",
    icon: TrendingDown,
    format: formatReportInteger
  },
  {
    key: "pastingPlatesProduced",
    label: "Placas empastadas",
    icon: Layers,
    format: formatReportInteger
  },
  {
    key: "plateLossRatePercent",
    label: "Taxa de perda",
    icon: Percent,
    format: formatReportPercent
  },
  {
    key: "yieldPercent",
    label: "Rendimento de placas",
    icon: Percent,
    format: formatReportPercent
  },
  {
    key: "scrapWeightPerLostPlateKg",
    label: "Peso médio por placa perdida",
    icon: Scale,
    format: formatReportWeight
  }
] as const

export function LossesKpiCards({ indicators }: LossesKpiCardsProps) {
  return (
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
              </div>
              <div className="rounded-ios-btn bg-apple-red/10 p-2 text-apple-red">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
