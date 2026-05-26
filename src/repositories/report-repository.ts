import { BaseRepository } from "@/repositories/base-repository"
import type { ReportListFilters } from "@/types/report"

type DateShiftRow = {
  date: string
  shift_id: string
}

type MachineLinkedRow = DateShiftRow & {
  machine_id: string
}

type OperatorLinkedRow = {
  date: string
  operator_id: string
}

export type ReportRawGridCastingRow = MachineLinkedRow & {
  id: string
  net_weight: number
  produced_qty: number
}

export type ReportRawLeadBallRow = DateShiftRow & {
  operator_id: string
  weight_produced: number
}

export type ReportRawOxideMillRow = DateShiftRow & {
  operator_id: string
  oxide_weight: number
}

export type ReportRawMixerRow = DateShiftRow & {
  operator_id: string
  lead_ball_weight: number
  oxide_weight: number
}

export type ReportRawLeadConsumptionRow = {
  date: string
  destination_sector_id: string
  weight_consumed: number
}

export type ReportRawPastingRow = MachineLinkedRow & {
  plates_qty: number
}

export type ReportRawAssemblyRow = MachineLinkedRow & {
  produced_qty: number
}

export type ReportRawSandingScrapRow = OperatorLinkedRow & {
  scrap_weight: number
  plates_qty_lost: number
}

export type ReportRawLabQualityRow = {
  date: string
  technician_id: string
  status: string
}

export type ReportRawFormationRow = {
  start_date: string
  operator_id: string
  status: string
}

export type ReportRawData = {
  gridCasting: ReportRawGridCastingRow[]
  leadBall: ReportRawLeadBallRow[]
  oxideMill: ReportRawOxideMillRow[]
  mixer: ReportRawMixerRow[]
  leadConsumption: ReportRawLeadConsumptionRow[]
  pasting: ReportRawPastingRow[]
  assembly: ReportRawAssemblyRow[]
  sandingScrap: ReportRawSandingScrapRow[]
  labQuality: ReportRawLabQualityRow[]
  formation: ReportRawFormationRow[]
}

export class ReportRepository extends BaseRepository {
  async fetchRawData(filters: ReportListFilters): Promise<ReportRawData> {
    const client = await this.getClient()

    let gridCastingQuery = client
      .from("grid_casting_production")
      .select("id, date, shift_id, machine_id, net_weight, produced_qty")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    let leadBallQuery = client
      .from("lead_ball_production")
      .select("date, shift_id, operator_id, weight_produced")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    let oxideMillQuery = client
      .from("oxide_mill_production")
      .select("date, shift_id, operator_id, oxide_weight")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    let mixerQuery = client
      .from("mixer_production")
      .select("date, shift_id, operator_id, lead_ball_weight, oxide_weight")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    const leadConsumptionQuery = client
      .from("lead_consumption")
      .select("date, destination_sector_id, weight_consumed")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    let pastingQuery = client
      .from("pasting_production")
      .select("date, shift_id, machine_id, plates_qty")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    let assemblyQuery = client
      .from("assembly_production")
      .select("date, shift_id, machine_id, produced_qty")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    const sandingScrapQuery = client
      .from("sanding_scrap")
      .select("date, operator_id, scrap_weight, plates_qty_lost")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    const labQualityQuery = client
      .from("lab_quality_control")
      .select("date, technician_id, status")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    const formationQuery = client
      .from("formation_records")
      .select("start_date, operator_id, status")
      .gte("start_date", filters.dateFrom)
      .lte("start_date", filters.dateTo)

    if (filters.shiftId) {
      gridCastingQuery = gridCastingQuery.eq("shift_id", filters.shiftId)
      leadBallQuery = leadBallQuery.eq("shift_id", filters.shiftId)
      oxideMillQuery = oxideMillQuery.eq("shift_id", filters.shiftId)
      mixerQuery = mixerQuery.eq("shift_id", filters.shiftId)
      pastingQuery = pastingQuery.eq("shift_id", filters.shiftId)
      assemblyQuery = assemblyQuery.eq("shift_id", filters.shiftId)
    }

    const [
      gridCastingResult,
      leadBallResult,
      oxideMillResult,
      mixerResult,
      leadConsumptionResult,
      pastingResult,
      assemblyResult,
      sandingScrapResult,
      labQualityResult,
      formationResult
    ] = await Promise.all([
      gridCastingQuery,
      leadBallQuery,
      oxideMillQuery,
      mixerQuery,
      leadConsumptionQuery,
      pastingQuery,
      assemblyQuery,
      sandingScrapQuery,
      labQualityQuery,
      formationQuery
    ])

    const errors = [
      gridCastingResult.error,
      leadBallResult.error,
      oxideMillResult.error,
      mixerResult.error,
      leadConsumptionResult.error,
      pastingResult.error,
      assemblyResult.error,
      sandingScrapResult.error,
      labQualityResult.error,
      formationResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      throw errors[0]
    }

    const gridCasting = (gridCastingResult.data ??
      []) as ReportRawGridCastingRow[]

    return {
      gridCasting,
      leadBall: (leadBallResult.data ?? []) as ReportRawLeadBallRow[],
      oxideMill: (oxideMillResult.data ?? []) as ReportRawOxideMillRow[],
      mixer: (mixerResult.data ?? []) as ReportRawMixerRow[],
      leadConsumption: (leadConsumptionResult.data ??
        []) as ReportRawLeadConsumptionRow[],
      pasting: (pastingResult.data ?? []) as ReportRawPastingRow[],
      assembly: (assemblyResult.data ?? []) as ReportRawAssemblyRow[],
      sandingScrap: (sandingScrapResult.data ??
        []) as ReportRawSandingScrapRow[],
      labQuality: (labQualityResult.data ?? []) as ReportRawLabQualityRow[],
      formation: (formationResult.data ?? []) as ReportRawFormationRow[]
    }
  }

  async fetchDowntimeMinutes(productionIds: string[]): Promise<number> {
    if (productionIds.length === 0) {
      return 0
    }

    const client = await this.getClient()
    const { data, error } = await client
      .from("grid_casting_downtime")
      .select("duration_minutes")
      .in("production_id", productionIds)

    if (error) {
      throw error
    }

    return (data ?? []).reduce((sum, row) => sum + row.duration_minutes, 0)
  }
}
