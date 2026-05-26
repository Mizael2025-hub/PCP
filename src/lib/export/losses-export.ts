import type {
  LossesDailyPoint,
  LossesDashboard,
  LossesIndicators,
  LossesModelSummary,
  LossesModuleSummary,
  LossesOperatorSummary,
  LossesPeriodFilters
} from "@/types/losses-dashboard"

export const LOSSES_EXPORT_VERSION = 1 as const

export type LossesExportMeta = {
  reportType: "losses-dashboard"
  version: typeof LOSSES_EXPORT_VERSION
  generatedAt: string
  dateFrom: string
  dateTo: string
}

export type LossesExportPayload = {
  meta: LossesExportMeta
  indicators: LossesIndicators
  moduleSummaries: LossesModuleSummary[]
  modelSummaries: LossesModelSummary[]
  operatorSummaries: LossesOperatorSummary[]
  dailyTrend: LossesDailyPoint[]
}

export type LossesExportResult = {
  success: boolean
  message: string
}

export function buildLossesExportPayload(
  dashboard: LossesDashboard,
  filters: LossesPeriodFilters
): LossesExportPayload {
  return {
    meta: {
      reportType: "losses-dashboard",
      version: LOSSES_EXPORT_VERSION,
      generatedAt: new Date().toISOString(),
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    },
    indicators: dashboard.indicators,
    moduleSummaries: dashboard.moduleSummaries,
    modelSummaries: dashboard.modelSummaries,
    operatorSummaries: dashboard.operatorSummaries,
    dailyTrend: dashboard.dailyTrend
  }
}

export async function exportLossesToExcel(
  _payload: LossesExportPayload
): Promise<LossesExportResult> {
  return {
    success: false,
    message: "Exportação Excel será disponibilizada em versão futura."
  }
}
