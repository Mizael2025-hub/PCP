import type { ReportChartItem } from "@/types/report"

export type LossesPeriodFilters = {
  dateFrom: string
  dateTo: string
}

export type LossesResolvedFilters = LossesPeriodFilters

export type LossesRecordCounts = {
  sandingScrap: number
  pastingProduction: number
}

export type LossesIndicators = {
  scrapWeightKg: number
  platesLost: number
  pastingPlatesProduced: number
  plateLossRatePercent: number
  yieldPercent: number
  scrapWeightPerLostPlateKg: number
  avgScrapWeightPerRecordKg: number
  avgPlatesLostPerRecord: number
  recordCounts: LossesRecordCounts
}

export type LossesDailyPoint = {
  date: string
  scrapWeightKg: number
  platesLost: number
  pastingPlatesProduced: number
  plateLossRatePercent: number
}

export type LossesModuleSummary = {
  key: "sanding_scrap" | "pasting_production"
  label: string
  recordCount: number
  primaryValue: number
  primaryLabel: string
  secondaryValue?: number
  secondaryLabel?: string
}

export type LossesModelSummary = {
  id: string
  label: string
  platesProduced: number
  recordCount: number
  sharePercent: number
}

export type LossesOperatorSummary = {
  id: string
  label: string
  scrapWeightKg: number
  platesLost: number
  recordCount: number
  sharePercent: number
}

export type LossesDashboard = {
  indicators: LossesIndicators
  dailyTrend: LossesDailyPoint[]
  moduleSummaries: LossesModuleSummary[]
  modelSummaries: LossesModelSummary[]
  operatorSummaries: LossesOperatorSummary[]
  scrapWeightByDay: ReportChartItem[]
  platesLostByDay: ReportChartItem[]
  pastingPlatesByDay: ReportChartItem[]
  lossRateByDay: ReportChartItem[]
  moduleComparison: ReportChartItem[]
}
