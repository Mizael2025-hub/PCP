import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import {
  formatReportInteger,
  formatReportPercent,
  formatReportWeight
} from "@/lib/utils/report-format"
import { BatteryModelRepository } from "@/repositories/battery-model-repository"
import { EmployeeRepository } from "@/repositories/employee-repository"
import {
  LossesDashboardRepository,
  type LossesRawData
} from "@/repositories/losses-dashboard-repository"
import { BaseService } from "@/services/base-service"
import type {
  LossesDailyPoint,
  LossesDashboard,
  LossesIndicators,
  LossesModelSummary,
  LossesModuleSummary,
  LossesOperatorSummary,
  LossesPeriodFilters,
  LossesResolvedFilters
} from "@/types/losses-dashboard"
import { parsePeriodFilters } from "@/validations/reports/period-filter-schema"

type DailyAccumulator = {
  scrapWeightKg: number
  platesLost: number
  pastingPlatesProduced: number
}

function safePercent(part: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return (part / total) * 100
}

function formatChartDate(date: string): string {
  return `${date.slice(8, 10)}/${date.slice(5, 7)}`
}

export class LossesDashboardService extends BaseService {
  private readonly repository = new LossesDashboardRepository()
  private readonly batteryModelRepository = new BatteryModelRepository()
  private readonly employeeRepository = new EmployeeRepository()

  resolveFilters(
    params: Partial<LossesResolvedFilters>,
    defaults: LossesResolvedFilters
  ): LossesResolvedFilters {
    const parsed = parsePeriodFilters({
      dateFrom: params.dateFrom ?? defaults.dateFrom,
      dateTo: params.dateTo ?? defaults.dateTo
    })

    return {
      dateFrom: parsed.dateFrom,
      dateTo: parsed.dateTo
    }
  }

  async getDashboard(
    filters: LossesPeriodFilters
  ): Promise<ActionResponse<LossesDashboard>> {
    try {
      const [rawData, batteryModels, employees] = await Promise.all([
        this.repository.fetchRawData(filters),
        this.batteryModelRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      const modelLabelMap = new Map(
        batteryModels.map((model) => [
          model.id,
          `${model.code} — ${model.name}`
        ])
      )
      const employeeLabelMap = new Map(
        employees.map((employee) => [employee.id, employee.name])
      )

      return actionSuccess(
        this.buildDashboard(rawData, modelLabelMap, employeeLabelMap)
      )
    } catch (error) {
      return this.handleError("LossesDashboardService.getDashboard", error)
    }
  }

  private buildDashboard(
    data: LossesRawData,
    modelLabelMap: Map<string, string>,
    employeeLabelMap: Map<string, string>
  ): LossesDashboard {
    const indicators = this.buildIndicators(data)
    const dailyTrend = this.buildDailyTrend(data)
    const moduleSummaries = this.buildModuleSummaries(data, indicators)
    const modelSummaries = this.buildModelSummaries(
      data,
      modelLabelMap,
      indicators.pastingPlatesProduced
    )
    const operatorSummaries = this.buildOperatorSummaries(
      data,
      employeeLabelMap,
      indicators.scrapWeightKg
    )

    return {
      indicators,
      dailyTrend,
      moduleSummaries,
      modelSummaries,
      operatorSummaries,
      scrapWeightByDay: dailyTrend.slice(-14).map((day) => ({
        label: formatChartDate(day.date),
        value: day.scrapWeightKg,
        displayValue: formatReportWeight(day.scrapWeightKg)
      })),
      platesLostByDay: dailyTrend.slice(-14).map((day) => ({
        label: formatChartDate(day.date),
        value: day.platesLost,
        displayValue: formatReportInteger(day.platesLost)
      })),
      pastingPlatesByDay: dailyTrend.slice(-14).map((day) => ({
        label: formatChartDate(day.date),
        value: day.pastingPlatesProduced,
        displayValue: formatReportInteger(day.pastingPlatesProduced)
      })),
      lossRateByDay: dailyTrend.slice(-14).map((day) => ({
        label: formatChartDate(day.date),
        value: day.plateLossRatePercent,
        displayValue: formatReportPercent(day.plateLossRatePercent)
      })),
      moduleComparison: [
        {
          label: "Refugo lixação (kg)",
          value: indicators.scrapWeightKg,
          displayValue: formatReportWeight(indicators.scrapWeightKg)
        },
        {
          label: "Placas perdidas",
          value: indicators.platesLost,
          displayValue: formatReportInteger(indicators.platesLost)
        },
        {
          label: "Placas empastadas",
          value: indicators.pastingPlatesProduced,
          displayValue: formatReportInteger(indicators.pastingPlatesProduced)
        }
      ]
    }
  }

  private buildIndicators(data: LossesRawData): LossesIndicators {
    const scrapWeightKg = data.sandingScrap.reduce(
      (sum, row) => sum + row.scrap_weight,
      0
    )
    const platesLost = data.sandingScrap.reduce(
      (sum, row) => sum + row.plates_qty_lost,
      0
    )
    const pastingPlatesProduced = data.pastingProduction.reduce(
      (sum, row) => sum + row.plates_qty,
      0
    )
    const sandingCount = data.sandingScrap.length
    const pastingCount = data.pastingProduction.length

    return {
      scrapWeightKg,
      platesLost,
      pastingPlatesProduced,
      plateLossRatePercent: safePercent(platesLost, pastingPlatesProduced),
      yieldPercent: safePercent(
        Math.max(pastingPlatesProduced - platesLost, 0),
        pastingPlatesProduced
      ),
      scrapWeightPerLostPlateKg:
        platesLost > 0 ? scrapWeightKg / platesLost : 0,
      avgScrapWeightPerRecordKg:
        sandingCount > 0 ? scrapWeightKg / sandingCount : 0,
      avgPlatesLostPerRecord: sandingCount > 0 ? platesLost / sandingCount : 0,
      recordCounts: {
        sandingScrap: sandingCount,
        pastingProduction: pastingCount
      }
    }
  }

  private buildDailyTrend(data: LossesRawData): LossesDailyPoint[] {
    const byDate = new Map<string, DailyAccumulator>()

    const ensureDate = (date: string): DailyAccumulator => {
      const current = byDate.get(date)

      if (current) {
        return current
      }

      const created: DailyAccumulator = {
        scrapWeightKg: 0,
        platesLost: 0,
        pastingPlatesProduced: 0
      }

      byDate.set(date, created)
      return created
    }

    for (const row of data.sandingScrap) {
      const day = ensureDate(row.date)
      day.scrapWeightKg += row.scrap_weight
      day.platesLost += row.plates_qty_lost
    }

    for (const row of data.pastingProduction) {
      ensureDate(row.date).pastingPlatesProduced += row.plates_qty
    }

    return Array.from(byDate.entries())
      .map(([date, stats]) => ({
        date,
        ...stats,
        plateLossRatePercent: safePercent(
          stats.platesLost,
          stats.pastingPlatesProduced
        )
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private buildModuleSummaries(
    data: LossesRawData,
    indicators: LossesIndicators
  ): LossesModuleSummary[] {
    return [
      {
        key: "sanding_scrap",
        label: "Lixação",
        recordCount: data.sandingScrap.length,
        primaryValue: indicators.scrapWeightKg,
        primaryLabel: "Peso de refugo",
        secondaryValue: indicators.platesLost,
        secondaryLabel: "Placas perdidas"
      },
      {
        key: "pasting_production",
        label: "Empastadeira",
        recordCount: data.pastingProduction.length,
        primaryValue: indicators.pastingPlatesProduced,
        primaryLabel: "Placas empastadas",
        secondaryValue: indicators.plateLossRatePercent,
        secondaryLabel: "Taxa de perda sobre empastadas (%)"
      }
    ]
  }

  private buildModelSummaries(
    data: LossesRawData,
    modelLabelMap: Map<string, string>,
    totalPlates: number
  ): LossesModelSummary[] {
    const byModel = new Map<
      string,
      { platesProduced: number; recordCount: number }
    >()

    for (const row of data.pastingProduction) {
      const current = byModel.get(row.battery_model_id) ?? {
        platesProduced: 0,
        recordCount: 0
      }

      current.platesProduced += row.plates_qty
      current.recordCount += 1
      byModel.set(row.battery_model_id, current)
    }

    return Array.from(byModel.entries())
      .map(([id, stats]) => ({
        id,
        label: modelLabelMap.get(id) ?? "Modelo não identificado",
        platesProduced: stats.platesProduced,
        recordCount: stats.recordCount,
        sharePercent: safePercent(stats.platesProduced, totalPlates)
      }))
      .sort((a, b) => b.platesProduced - a.platesProduced)
  }

  private buildOperatorSummaries(
    data: LossesRawData,
    employeeLabelMap: Map<string, string>,
    totalScrapWeightKg: number
  ): LossesOperatorSummary[] {
    const byOperator = new Map<
      string,
      { scrapWeightKg: number; platesLost: number; recordCount: number }
    >()

    for (const row of data.sandingScrap) {
      const current = byOperator.get(row.operator_id) ?? {
        scrapWeightKg: 0,
        platesLost: 0,
        recordCount: 0
      }

      current.scrapWeightKg += row.scrap_weight
      current.platesLost += row.plates_qty_lost
      current.recordCount += 1
      byOperator.set(row.operator_id, current)
    }

    return Array.from(byOperator.entries())
      .map(([id, stats]) => ({
        id,
        label: employeeLabelMap.get(id) ?? "Operador não identificado",
        scrapWeightKg: stats.scrapWeightKg,
        platesLost: stats.platesLost,
        recordCount: stats.recordCount,
        sharePercent: safePercent(stats.scrapWeightKg, totalScrapWeightKg)
      }))
      .sort((a, b) => b.scrapWeightKg - a.scrapWeightKg)
  }
}
