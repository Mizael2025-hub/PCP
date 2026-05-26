import type { LossesDashboard } from "@/types/losses-dashboard"

import { LossesCharts } from "./losses-charts"
import { LossesKpiCards } from "./losses-kpi-cards"
import { LossesSummaryTables } from "./losses-summary-table"

export type LossesDashboardViewProps = {
  dashboard: LossesDashboard
}

export function LossesDashboardView({ dashboard }: LossesDashboardViewProps) {
  return (
    <div className="space-y-6">
      <LossesKpiCards indicators={dashboard.indicators} />
      <LossesCharts dashboard={dashboard} />
      <LossesSummaryTables
        moduleSummaries={dashboard.moduleSummaries}
        modelSummaries={dashboard.modelSummaries}
        operatorSummaries={dashboard.operatorSummaries}
      />
    </div>
  )
}
