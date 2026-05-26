import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { formatReportWeight } from "@/lib/utils/report-format"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { MachineRepository } from "@/repositories/machine-repository"
import {
  MassBalanceRepository,
  type MassBalanceRawData
} from "@/repositories/mass-balance-repository"
import { BaseService } from "@/services/base-service"
import type {
  MassBalanceDailyPoint,
  MassBalanceDashboard,
  MassBalanceFlowStep,
  MassBalanceIndicators,
  MassBalanceListFilters,
  MassBalanceRecordCounts
} from "@/types/mass-balance"
import type { ReportResolvedFilters } from "@/types/report"
import { parseReportFilters } from "@/validations/reports/report-filter-schema"

type DailyAccumulator = {
  leadInputKg: number
  mixerLeadKg: number
  gridNetKg: number
  scrapKg: number
}

function sumLeadConsumption(
  rows: MassBalanceRawData["leadConsumption"]
): number {
  return rows.reduce((sum, row) => sum + row.weight_consumed, 0)
}

function sumMixerLead(rows: MassBalanceRawData["mixer"]): number {
  return rows.reduce((sum, row) => sum + row.lead_ball_weight, 0)
}

function sumMixerOxide(rows: MassBalanceRawData["mixer"]): number {
  return rows.reduce((sum, row) => sum + row.oxide_weight, 0)
}

function sumGridNet(rows: MassBalanceRawData["gridCasting"]): number {
  return rows.reduce((sum, row) => sum + row.net_weight, 0)
}

function sumGridGross(rows: MassBalanceRawData["gridCasting"]): number {
  return rows.reduce((sum, row) => sum + row.gross_weight, 0)
}

function sumScrap(rows: MassBalanceRawData["sandingScrap"]): number {
  return rows.reduce((sum, row) => sum + row.scrap_weight, 0)
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

export class MassBalanceService extends BaseService {
  private readonly repository = new MassBalanceRepository()
  private readonly machineRepository = new MachineRepository()
  private readonly employeeRepository = new EmployeeRepository()

  resolveFilters(
    params: Partial<ReportResolvedFilters>,
    defaults: ReportResolvedFilters
  ): ReportResolvedFilters {
    const parsed = parseReportFilters({
      dateFrom: params.dateFrom ?? defaults.dateFrom,
      dateTo: params.dateTo ?? defaults.dateTo,
      shiftId: params.shiftId ?? defaults.shiftId,
      sectorId: params.sectorId ?? defaults.sectorId
    })

    return {
      dateFrom: parsed.dateFrom,
      dateTo: parsed.dateTo,
      shiftId: parsed.shiftId ?? "",
      sectorId: parsed.sectorId ?? ""
    }
  }

  async getDashboard(
    filters: MassBalanceListFilters
  ): Promise<ActionResponse<MassBalanceDashboard>> {
    try {
      const rawData = await this.repository.fetchRawData(filters)

      const filteredData = filters.sectorId
        ? await this.applySectorFilter(rawData, filters.sectorId)
        : rawData

      return actionSuccess(this.buildDashboard(filteredData))
    } catch (error) {
      return this.handleError("MassBalanceService.getDashboard", error)
    }
  }

  private async applySectorFilter(
    data: MassBalanceRawData,
    sectorId: string
  ): Promise<MassBalanceRawData> {
    const [machines, employees] = await Promise.all([
      this.machineRepository.findAll(true),
      this.employeeRepository.findAll(true)
    ])

    const machineSectorMap = new Map(
      machines.map((machine) => [machine.id, machine.sector_id])
    )
    const employeeSectorMap = new Map(
      employees.map((employee) => [employee.id, employee.sector_id])
    )

    return {
      leadConsumption: data.leadConsumption.filter(
        (row) => row.destination_sector_id === sectorId
      ),
      mixer: data.mixer.filter(
        (row) => employeeSectorMap.get(row.operator_id) === sectorId
      ),
      gridCasting: data.gridCasting.filter(
        (row) => machineSectorMap.get(row.machine_id) === sectorId
      ),
      sandingScrap: data.sandingScrap.filter(
        (row) => employeeSectorMap.get(row.operator_id) === sectorId
      )
    }
  }

  private buildDashboard(data: MassBalanceRawData): MassBalanceDashboard {
    const indicators = this.buildIndicators(data)
    const dailyTrend = this.buildDailyTrend(data)

    return {
      indicators,
      dailyTrend,
      flowSteps: this.buildFlowSteps(data, indicators),
      outputDistribution: this.buildOutputDistribution(indicators),
      crossModuleTotals: this.buildCrossModuleTotals(indicators),
      dailyLeadInput: this.buildDailyLeadInput(dailyTrend),
      dailyRegisteredOutput: this.buildDailyRegisteredOutput(dailyTrend),
      dailyBalanceTrend: this.buildDailyBalanceTrend(dailyTrend)
    }
  }

  private buildIndicators(data: MassBalanceRawData): MassBalanceIndicators {
    const leadInputKg = sumLeadConsumption(data.leadConsumption)
    const mixerLeadKg = sumMixerLead(data.mixer)
    const mixerOxideKg = sumMixerOxide(data.mixer)
    const mixerTotalKg = mixerLeadKg + mixerOxideKg
    const gridNetKg = sumGridNet(data.gridCasting)
    const gridGrossKg = sumGridGross(data.gridCasting)
    const scrapKg = sumScrap(data.sandingScrap)
    const registeredOutputKg = mixerLeadKg + gridNetKg + scrapKg
    const balanceKg = leadInputKg - registeredOutputKg

    const recordCounts: MassBalanceRecordCounts = {
      leadConsumption: data.leadConsumption.length,
      mixer: data.mixer.length,
      gridCasting: data.gridCasting.length,
      sandingScrap: data.sandingScrap.length
    }

    return {
      leadInputKg,
      mixerLeadKg,
      mixerOxideKg,
      mixerTotalKg,
      gridNetKg,
      gridGrossKg,
      scrapKg,
      registeredOutputKg,
      balanceKg,
      balancePercent: safePercent(balanceKg, leadInputKg),
      scrapRatePercent: safePercent(scrapKg, leadInputKg),
      yieldPercent: safePercent(gridNetKg, leadInputKg),
      mixerLeadSharePercent: safePercent(mixerLeadKg, leadInputKg),
      recordCounts
    }
  }

  private buildDailyTrend(data: MassBalanceRawData): MassBalanceDailyPoint[] {
    const byDate = new Map<string, DailyAccumulator>()

    const ensureDate = (date: string): DailyAccumulator => {
      const current = byDate.get(date)

      if (current) {
        return current
      }

      const created: DailyAccumulator = {
        leadInputKg: 0,
        mixerLeadKg: 0,
        gridNetKg: 0,
        scrapKg: 0
      }

      byDate.set(date, created)
      return created
    }

    for (const row of data.leadConsumption) {
      ensureDate(row.date).leadInputKg += row.weight_consumed
    }

    for (const row of data.mixer) {
      ensureDate(row.date).mixerLeadKg += row.lead_ball_weight
    }

    for (const row of data.gridCasting) {
      ensureDate(row.date).gridNetKg += row.net_weight
    }

    for (const row of data.sandingScrap) {
      ensureDate(row.date).scrapKg += row.scrap_weight
    }

    return Array.from(byDate.entries())
      .map(([date, stats]) => {
        const registeredOutputKg =
          stats.mixerLeadKg + stats.gridNetKg + stats.scrapKg

        return {
          date,
          ...stats,
          registeredOutputKg,
          balanceKg: stats.leadInputKg - registeredOutputKg
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private buildFlowSteps(
    data: MassBalanceRawData,
    indicators: MassBalanceIndicators
  ): MassBalanceFlowStep[] {
    const base = indicators.leadInputKg

    return [
      {
        key: "lead_input",
        label: "Entrada de chumbo",
        description: "Consumo registrado em lead_consumption.",
        weightKg: indicators.leadInputKg,
        sharePercent: base > 0 ? 100 : 0,
        recordCount: data.leadConsumption.length,
        tone: "input"
      },
      {
        key: "mixer_lead",
        label: "Chumbo no misturador",
        description: "Soma de lead_ball_weight em mixer_production.",
        weightKg: indicators.mixerLeadKg,
        sharePercent: safePercent(indicators.mixerLeadKg, base),
        recordCount: data.mixer.length,
        tone: "process"
      },
      {
        key: "grid_net",
        label: "Produção fundidora",
        description: "Soma de net_weight em grid_casting_production.",
        weightKg: indicators.gridNetKg,
        sharePercent: safePercent(indicators.gridNetKg, base),
        recordCount: data.gridCasting.length,
        tone: "output"
      },
      {
        key: "scrap",
        label: "Refugo na lixação",
        description: "Soma de scrap_weight em sanding_scrap.",
        weightKg: indicators.scrapKg,
        sharePercent: safePercent(indicators.scrapKg, base),
        recordCount: data.sandingScrap.length,
        tone: "loss"
      },
      {
        key: "balance",
        label: "Saldo de massa",
        description:
          "Entrada − (misturador + fundidora + refugo). Positivo indica massa não rastreada.",
        weightKg: indicators.balanceKg,
        sharePercent: indicators.balancePercent,
        recordCount:
          indicators.recordCounts.leadConsumption +
          indicators.recordCounts.mixer +
          indicators.recordCounts.gridCasting +
          indicators.recordCounts.sandingScrap,
        tone: "balance"
      }
    ]
  }

  private buildOutputDistribution(
    indicators: MassBalanceIndicators
  ): MassBalanceDashboard["outputDistribution"] {
    return [
      {
        label: "Misturador (chumbo)",
        value: indicators.mixerLeadKg,
        displayValue: formatReportWeight(indicators.mixerLeadKg)
      },
      {
        label: "Fundidora (líquido)",
        value: indicators.gridNetKg,
        displayValue: formatReportWeight(indicators.gridNetKg)
      },
      {
        label: "Lixação (refugo)",
        value: indicators.scrapKg,
        displayValue: formatReportWeight(indicators.scrapKg)
      }
    ].filter((item) => item.value > 0)
  }

  private buildCrossModuleTotals(
    indicators: MassBalanceIndicators
  ): MassBalanceDashboard["crossModuleTotals"] {
    return [
      {
        label: "Consumo de chumbo",
        value: indicators.leadInputKg,
        displayValue: formatReportWeight(indicators.leadInputKg)
      },
      {
        label: "Misturador (chumbo)",
        value: indicators.mixerLeadKg,
        displayValue: formatReportWeight(indicators.mixerLeadKg)
      },
      {
        label: "Fundidora (líquido)",
        value: indicators.gridNetKg,
        displayValue: formatReportWeight(indicators.gridNetKg)
      },
      {
        label: "Lixação (refugo)",
        value: indicators.scrapKg,
        displayValue: formatReportWeight(indicators.scrapKg)
      }
    ]
  }

  private buildDailyLeadInput(
    dailyTrend: MassBalanceDailyPoint[]
  ): MassBalanceDashboard["dailyLeadInput"] {
    return dailyTrend.slice(-14).map((day) => ({
      label: formatChartDate(day.date),
      value: day.leadInputKg,
      displayValue: formatReportWeight(day.leadInputKg)
    }))
  }

  private buildDailyRegisteredOutput(
    dailyTrend: MassBalanceDailyPoint[]
  ): MassBalanceDashboard["dailyRegisteredOutput"] {
    return dailyTrend.slice(-14).map((day) => ({
      label: formatChartDate(day.date),
      value: day.registeredOutputKg,
      displayValue: formatReportWeight(day.registeredOutputKg)
    }))
  }

  private buildDailyBalanceTrend(
    dailyTrend: MassBalanceDailyPoint[]
  ): MassBalanceDashboard["dailyBalanceTrend"] {
    return dailyTrend.slice(-14).map((day) => ({
      label: formatChartDate(day.date),
      value: Math.abs(day.balanceKg),
      displayValue: formatReportWeight(day.balanceKg)
    }))
  }
}
