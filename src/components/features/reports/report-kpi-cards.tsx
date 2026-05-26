import {
  Activity,
  Clock3,
  FlaskConical,
  Package,
  Scale,
  Trash2
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { formatDurationLabel } from "@/lib/utils/datetime"
import {
  formatReportInteger,
  formatReportPercent,
  formatReportWeight
} from "@/lib/utils/report-format"
import type { ReportKpiSummary } from "@/types/report"

export type ReportKpiCardsProps = {
  kpis: ReportKpiSummary
}

const KPI_ITEMS = [
  {
    key: "totalRecords",
    label: "Apontamentos",
    icon: Activity,
    format: formatReportInteger
  },
  {
    key: "producedUnits",
    label: "Unidades produzidas",
    icon: Package,
    format: formatReportInteger
  },
  {
    key: "totalWeightKg",
    label: "Peso total",
    icon: Scale,
    format: formatReportWeight
  },
  {
    key: "scrapWeightKg",
    label: "Refugo",
    icon: Trash2,
    format: formatReportWeight
  },
  {
    key: "downtimeMinutes",
    label: "Paradas",
    icon: Clock3,
    format: formatDurationLabel
  },
  {
    key: "labApprovalRate",
    label: "Aprovação laboratorial",
    icon: FlaskConical,
    format: formatReportPercent
  }
] as const

export function ReportKpiCards({ kpis }: ReportKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {KPI_ITEMS.map((item) => {
        const Icon = item.icon
        const value = kpis[item.key]

        return (
          <Card key={item.key} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {item.format(value)}
                </p>
              </div>
              <div className="rounded-ios-btn bg-blue-500/10 p-2 text-blue-500">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
