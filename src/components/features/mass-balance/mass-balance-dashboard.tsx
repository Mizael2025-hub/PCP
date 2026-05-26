import type { MassBalanceDashboard } from "@/types/mass-balance"

import { MassBalanceCharts } from "./mass-balance-charts"
import { MassBalanceFlowTable } from "./mass-balance-flow-table"
import { MassBalanceKpiCards } from "./mass-balance-kpi-cards"

export type MassBalanceDashboardViewProps = {
  dashboard: MassBalanceDashboard
}

export function MassBalanceDashboardView({
  dashboard
}: MassBalanceDashboardViewProps) {
  return (
    <div className="space-y-6">
      <MassBalanceKpiCards indicators={dashboard.indicators} />
      <MassBalanceCharts dashboard={dashboard} />
      <MassBalanceFlowTable steps={dashboard.flowSteps} />
    </div>
  )
}
