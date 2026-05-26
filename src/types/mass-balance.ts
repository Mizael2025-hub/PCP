import type { ReportChartItem, ReportListFilters } from "@/types/report"

export type MassBalanceListFilters = ReportListFilters

export type MassBalanceRecordCounts = {
  leadConsumption: number
  mixer: number
  gridCasting: number
  sandingScrap: number
}

export type MassBalanceIndicators = {
  leadInputKg: number
  mixerLeadKg: number
  mixerOxideKg: number
  mixerTotalKg: number
  gridNetKg: number
  gridGrossKg: number
  scrapKg: number
  registeredOutputKg: number
  balanceKg: number
  balancePercent: number
  scrapRatePercent: number
  yieldPercent: number
  mixerLeadSharePercent: number
  recordCounts: MassBalanceRecordCounts
}

export type MassBalanceDailyPoint = {
  date: string
  leadInputKg: number
  mixerLeadKg: number
  gridNetKg: number
  scrapKg: number
  registeredOutputKg: number
  balanceKg: number
}

export type MassBalanceFlowStep = {
  key: "lead_input" | "mixer_lead" | "grid_net" | "scrap" | "balance"
  label: string
  description: string
  weightKg: number
  sharePercent: number
  recordCount: number
  tone: "input" | "process" | "output" | "loss" | "balance"
}

export type MassBalanceDashboard = {
  indicators: MassBalanceIndicators
  dailyTrend: MassBalanceDailyPoint[]
  flowSteps: MassBalanceFlowStep[]
  outputDistribution: ReportChartItem[]
  crossModuleTotals: ReportChartItem[]
  dailyLeadInput: ReportChartItem[]
  dailyRegisteredOutput: ReportChartItem[]
  dailyBalanceTrend: ReportChartItem[]
}
