export type ReportListFilters = {
  dateFrom: string
  dateTo: string
  shiftId?: string
  sectorId?: string
}

export type ReportModuleKey =
  | "grid_casting"
  | "lead_ball"
  | "oxide_mill"
  | "mixer"
  | "lead_consumption"
  | "pasting"
  | "assembly"
  | "sanding_scrap"
  | "lab_quality"
  | "formation"

export type ReportModuleSummary = {
  key: ReportModuleKey
  label: string
  recordCount: number
  primaryValue: number
  primaryLabel: string
  secondaryValue?: number
  secondaryLabel?: string
}

export type ReportDailyTrend = {
  date: string
  totalWeightKg: number
  producedUnits: number
  scrapWeightKg: number
}

export type ReportQualitySummary = {
  totalSamples: number
  approved: number
  rejected: number
  pending: number
  approvalRate: number
}

export type ReportKpiSummary = {
  totalRecords: number
  producedUnits: number
  totalWeightKg: number
  scrapWeightKg: number
  downtimeMinutes: number
  labApprovalRate: number
}

export type ReportChartItem = {
  label: string
  value: number
  displayValue?: string
}

export type ReportDashboard = {
  kpis: ReportKpiSummary
  moduleSummaries: ReportModuleSummary[]
  dailyTrend: ReportDailyTrend[]
  qualitySummary: ReportQualitySummary
  productionByModule: ReportChartItem[]
  qualityChart: ReportChartItem[]
  scrapByDay: ReportChartItem[]
}

export type ReportResolvedFilters = {
  dateFrom: string
  dateTo: string
  shiftId: string
  sectorId: string
}
