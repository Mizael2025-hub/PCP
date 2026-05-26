import type { ReportDashboard } from "@/types/report"

import { ReportCharts } from "./report-charts"
import { ReportKpiCards } from "./report-kpi-cards"
import { ReportSummaryTable } from "./report-summary-table"

export type ReportsDashboardProps = {
  dashboard: ReportDashboard
}

export function ReportsDashboard({ dashboard }: ReportsDashboardProps) {
  return (
    <div className="space-y-6">
      <ReportKpiCards kpis={dashboard.kpis} />
      <ReportCharts dashboard={dashboard} />
      <ReportSummaryTable modules={dashboard.moduleSummaries} />
    </div>
  )
}
