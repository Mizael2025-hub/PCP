import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import {
  formatReportInteger,
  formatReportWeight
} from "@/lib/utils/report-format"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { MachineRepository } from "@/repositories/machine-repository"
import {
  ReportRepository,
  type ReportRawData
} from "@/repositories/report-repository"
import { BaseService } from "@/services/base-service"
import type {
  ReportDailyTrend,
  ReportDashboard,
  ReportKpiSummary,
  ReportListFilters,
  ReportModuleKey,
  ReportModuleSummary,
  ReportQualitySummary,
  ReportResolvedFilters
} from "@/types/report"
import { parseReportFilters } from "@/validations/reports/report-filter-schema"

const MODULE_LABELS: Record<ReportModuleKey, string> = {
  grid_casting: "Fundidora de Grades",
  lead_ball: "Boleira",
  oxide_mill: "Moinho de Óxido",
  mixer: "Misturador",
  lead_consumption: "Consumo de Chumbo",
  pasting: "Empastadeira",
  assembly: "Montagem",
  sanding_scrap: "Lixação",
  lab_quality: "Laboratório",
  formation: "Formação"
}

function formatWeight(value: number): string {
  return formatReportWeight(value)
}

function formatInteger(value: number): string {
  return formatReportInteger(value)
}

export class ReportService extends BaseService {
  private readonly repository = new ReportRepository()
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
    filters: ReportListFilters
  ): Promise<ActionResponse<ReportDashboard>> {
    try {
      const [rawData, machines, employees] = await Promise.all([
        this.repository.fetchRawData(filters),
        this.machineRepository.findAll(true),
        this.employeeRepository.findAll(true)
      ])

      const filteredData = this.applySectorFilter(
        rawData,
        filters.sectorId,
        machines,
        employees
      )

      const downtimeMinutes = await this.repository.fetchDowntimeMinutes(
        filteredData.gridCasting.map((row) => row.id)
      )

      const dashboard = this.buildDashboard(filteredData, downtimeMinutes)

      return actionSuccess(dashboard)
    } catch (error) {
      return this.handleError("ReportService.getDashboard", error)
    }
  }

  private applySectorFilter(
    data: ReportRawData,
    sectorId: string | undefined,
    machines: Awaited<ReturnType<MachineRepository["findAll"]>>,
    employees: Awaited<ReturnType<EmployeeRepository["findAll"]>>
  ): ReportRawData {
    if (!sectorId) {
      return data
    }

    const machineSectorMap = new Map(
      machines.map((machine) => [machine.id, machine.sector_id])
    )
    const employeeSectorMap = new Map(
      employees.map((employee) => [employee.id, employee.sector_id])
    )

    const matchesMachine = (machineId: string) =>
      machineSectorMap.get(machineId) === sectorId

    const matchesEmployee = (employeeId: string) =>
      employeeSectorMap.get(employeeId) === sectorId

    const gridCasting = data.gridCasting.filter((row) =>
      matchesMachine(row.machine_id)
    )

    return {
      gridCasting,
      leadBall: data.leadBall.filter((row) => matchesEmployee(row.operator_id)),
      oxideMill: data.oxideMill.filter((row) =>
        matchesEmployee(row.operator_id)
      ),
      mixer: data.mixer.filter((row) => matchesEmployee(row.operator_id)),
      leadConsumption: data.leadConsumption.filter(
        (row) => row.destination_sector_id === sectorId
      ),
      pasting: data.pasting.filter((row) => matchesMachine(row.machine_id)),
      assembly: data.assembly.filter((row) => matchesMachine(row.machine_id)),
      sandingScrap: data.sandingScrap.filter((row) =>
        matchesEmployee(row.operator_id)
      ),
      labQuality: data.labQuality.filter((row) =>
        matchesEmployee(row.technician_id)
      ),
      formation: data.formation.filter((row) =>
        matchesEmployee(row.operator_id)
      )
    }
  }

  private buildDashboard(
    data: ReportRawData,
    downtimeMinutes: number
  ): ReportDashboard {
    const moduleSummaries = this.buildModuleSummaries(data)
    const dailyTrend = this.buildDailyTrend(data)
    const qualitySummary = this.buildQualitySummary(data.labQuality)
    const kpis = this.buildKpis(
      data,
      moduleSummaries,
      qualitySummary,
      downtimeMinutes
    )

    return {
      kpis,
      moduleSummaries,
      dailyTrend,
      qualitySummary,
      productionByModule: moduleSummaries
        .filter((module) => module.primaryValue > 0 || module.recordCount > 0)
        .map((module) => ({
          label: module.label,
          value: module.primaryValue,
          displayValue: `${formatInteger(module.recordCount)} reg. · ${module.primaryLabel}: ${formatWeight(module.primaryValue)}`
        })),
      qualityChart: [
        {
          label: "Aprovadas",
          value: qualitySummary.approved,
          displayValue: formatInteger(qualitySummary.approved)
        },
        {
          label: "Reprovadas",
          value: qualitySummary.rejected,
          displayValue: formatInteger(qualitySummary.rejected)
        },
        {
          label: "Pendentes",
          value: qualitySummary.pending,
          displayValue: formatInteger(qualitySummary.pending)
        }
      ],
      scrapByDay: dailyTrend
        .filter((day) => day.scrapWeightKg > 0)
        .slice(-14)
        .map((day) => ({
          label: day.date.slice(8, 10) + "/" + day.date.slice(5, 7),
          value: day.scrapWeightKg,
          displayValue: formatWeight(day.scrapWeightKg)
        }))
    }
  }

  private buildModuleSummaries(data: ReportRawData): ReportModuleSummary[] {
    const gridWeight = data.gridCasting.reduce(
      (sum, row) => sum + row.net_weight,
      0
    )
    const gridUnits = data.gridCasting.reduce(
      (sum, row) => sum + row.produced_qty,
      0
    )
    const leadBallWeight = data.leadBall.reduce(
      (sum, row) => sum + row.weight_produced,
      0
    )
    const oxideWeight = data.oxideMill.reduce(
      (sum, row) => sum + row.oxide_weight,
      0
    )
    const mixerWeight = data.mixer.reduce(
      (sum, row) => sum + row.lead_ball_weight + row.oxide_weight,
      0
    )
    const consumptionWeight = data.leadConsumption.reduce(
      (sum, row) => sum + row.weight_consumed,
      0
    )
    const pastingPlates = data.pasting.reduce(
      (sum, row) => sum + row.plates_qty,
      0
    )
    const assemblyUnits = data.assembly.reduce(
      (sum, row) => sum + row.produced_qty,
      0
    )
    const scrapWeight = data.sandingScrap.reduce(
      (sum, row) => sum + row.scrap_weight,
      0
    )
    const scrapPlates = data.sandingScrap.reduce(
      (sum, row) => sum + row.plates_qty_lost,
      0
    )
    const completedFormations = data.formation.filter(
      (row) => row.status === "COMPLETED"
    ).length

    return [
      {
        key: "grid_casting",
        label: MODULE_LABELS.grid_casting,
        recordCount: data.gridCasting.length,
        primaryValue: gridWeight,
        primaryLabel: "Peso líquido",
        secondaryValue: gridUnits,
        secondaryLabel: "Grades produzidas"
      },
      {
        key: "lead_ball",
        label: MODULE_LABELS.lead_ball,
        recordCount: data.leadBall.length,
        primaryValue: leadBallWeight,
        primaryLabel: "Peso produzido"
      },
      {
        key: "oxide_mill",
        label: MODULE_LABELS.oxide_mill,
        recordCount: data.oxideMill.length,
        primaryValue: oxideWeight,
        primaryLabel: "Peso de óxido"
      },
      {
        key: "mixer",
        label: MODULE_LABELS.mixer,
        recordCount: data.mixer.length,
        primaryValue: mixerWeight,
        primaryLabel: "Peso total bateladas"
      },
      {
        key: "lead_consumption",
        label: MODULE_LABELS.lead_consumption,
        recordCount: data.leadConsumption.length,
        primaryValue: consumptionWeight,
        primaryLabel: "Peso consumido"
      },
      {
        key: "pasting",
        label: MODULE_LABELS.pasting,
        recordCount: data.pasting.length,
        primaryValue: pastingPlates,
        primaryLabel: "Placas empastadas"
      },
      {
        key: "assembly",
        label: MODULE_LABELS.assembly,
        recordCount: data.assembly.length,
        primaryValue: assemblyUnits,
        primaryLabel: "Baterias montadas"
      },
      {
        key: "sanding_scrap",
        label: MODULE_LABELS.sanding_scrap,
        recordCount: data.sandingScrap.length,
        primaryValue: scrapWeight,
        primaryLabel: "Peso de refugo",
        secondaryValue: scrapPlates,
        secondaryLabel: "Placas perdidas"
      },
      {
        key: "lab_quality",
        label: MODULE_LABELS.lab_quality,
        recordCount: data.labQuality.length,
        primaryValue: data.labQuality.filter((row) => row.status === "APPROVED")
          .length,
        primaryLabel: "Amostras aprovadas"
      },
      {
        key: "formation",
        label: MODULE_LABELS.formation,
        recordCount: data.formation.length,
        primaryValue: completedFormations,
        primaryLabel: "Formações concluídas"
      }
    ]
  }

  private buildDailyTrend(data: ReportRawData): ReportDailyTrend[] {
    const byDate = new Map<
      string,
      { totalWeightKg: number; producedUnits: number; scrapWeightKg: number }
    >()

    const addToDate = (
      date: string,
      weight = 0,
      units = 0,
      scrap = 0
    ): void => {
      const current = byDate.get(date) ?? {
        totalWeightKg: 0,
        producedUnits: 0,
        scrapWeightKg: 0
      }

      current.totalWeightKg += weight
      current.producedUnits += units
      current.scrapWeightKg += scrap

      byDate.set(date, current)
    }

    for (const row of data.gridCasting) {
      addToDate(row.date, row.net_weight, row.produced_qty)
    }

    for (const row of data.leadBall) {
      addToDate(row.date, row.weight_produced)
    }

    for (const row of data.oxideMill) {
      addToDate(row.date, row.oxide_weight)
    }

    for (const row of data.mixer) {
      addToDate(row.date, row.lead_ball_weight + row.oxide_weight)
    }

    for (const row of data.leadConsumption) {
      addToDate(row.date, row.weight_consumed)
    }

    for (const row of data.assembly) {
      addToDate(row.date, 0, row.produced_qty)
    }

    for (const row of data.sandingScrap) {
      addToDate(row.date, 0, 0, row.scrap_weight)
    }

    return Array.from(byDate.entries())
      .map(([date, stats]) => ({
        date,
        ...stats
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private buildQualitySummary(
    records: ReportRawData["labQuality"]
  ): ReportQualitySummary {
    const approved = records.filter((row) => row.status === "APPROVED").length
    const rejected = records.filter((row) => row.status === "REJECTED").length
    const pending = records.filter((row) => row.status === "PENDING").length
    const totalSamples = records.length
    const approvalRate = totalSamples > 0 ? (approved / totalSamples) * 100 : 0

    return {
      totalSamples,
      approved,
      rejected,
      pending,
      approvalRate
    }
  }

  private buildKpis(
    data: ReportRawData,
    modules: ReportModuleSummary[],
    quality: ReportQualitySummary,
    downtimeMinutes: number
  ): ReportKpiSummary {
    const totalRecords = modules.reduce(
      (sum, module) => sum + module.recordCount,
      0
    )
    const gridCasting = modules.find((module) => module.key === "grid_casting")
    const pasting = modules.find((module) => module.key === "pasting")
    const assembly = modules.find((module) => module.key === "assembly")
    const producedUnits =
      (gridCasting?.secondaryValue ?? 0) +
      (pasting?.primaryValue ?? 0) +
      (assembly?.primaryValue ?? 0)
    const totalWeightKg = modules
      .filter((module) =>
        [
          "grid_casting",
          "lead_ball",
          "oxide_mill",
          "mixer",
          "lead_consumption"
        ].includes(module.key)
      )
      .reduce((sum, module) => sum + module.primaryValue, 0)
    const scrapModule = modules.find((module) => module.key === "sanding_scrap")

    return {
      totalRecords,
      producedUnits,
      totalWeightKg,
      scrapWeightKg: scrapModule?.primaryValue ?? 0,
      downtimeMinutes,
      labApprovalRate: quality.approvalRate
    }
  }
}
