import { BaseRepository } from "@/repositories/base-repository"
import type { MassBalanceListFilters } from "@/types/mass-balance"

export type MassBalanceLeadConsumptionRow = {
  date: string
  destination_sector_id: string
  weight_consumed: number
}

export type MassBalanceMixerRow = {
  date: string
  shift_id: string
  operator_id: string
  lead_ball_weight: number
  oxide_weight: number
}

export type MassBalanceGridCastingRow = {
  date: string
  shift_id: string
  machine_id: string
  net_weight: number
  gross_weight: number
}

export type MassBalanceSandingScrapRow = {
  date: string
  operator_id: string
  scrap_weight: number
}

export type MassBalanceRawData = {
  leadConsumption: MassBalanceLeadConsumptionRow[]
  mixer: MassBalanceMixerRow[]
  gridCasting: MassBalanceGridCastingRow[]
  sandingScrap: MassBalanceSandingScrapRow[]
}

export class MassBalanceRepository extends BaseRepository {
  async fetchRawData(
    filters: MassBalanceListFilters
  ): Promise<MassBalanceRawData> {
    const client = await this.getClient()

    let mixerQuery = client
      .from("mixer_production")
      .select("date, shift_id, operator_id, lead_ball_weight, oxide_weight")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    let gridCastingQuery = client
      .from("grid_casting_production")
      .select("date, shift_id, machine_id, net_weight, gross_weight")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    const leadConsumptionQuery = client
      .from("lead_consumption")
      .select("date, destination_sector_id, weight_consumed")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    const sandingScrapQuery = client
      .from("sanding_scrap")
      .select("date, operator_id, scrap_weight")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    if (filters.shiftId) {
      mixerQuery = mixerQuery.eq("shift_id", filters.shiftId)
      gridCastingQuery = gridCastingQuery.eq("shift_id", filters.shiftId)
    }

    const [
      leadConsumptionResult,
      mixerResult,
      gridCastingResult,
      sandingScrapResult
    ] = await Promise.all([
      leadConsumptionQuery,
      mixerQuery,
      gridCastingQuery,
      sandingScrapQuery
    ])

    const errors = [
      leadConsumptionResult.error,
      mixerResult.error,
      gridCastingResult.error,
      sandingScrapResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      throw errors[0]
    }

    return {
      leadConsumption: (leadConsumptionResult.data ??
        []) as MassBalanceLeadConsumptionRow[],
      mixer: (mixerResult.data ?? []) as MassBalanceMixerRow[],
      gridCasting: (gridCastingResult.data ??
        []) as MassBalanceGridCastingRow[],
      sandingScrap: (sandingScrapResult.data ??
        []) as MassBalanceSandingScrapRow[]
    }
  }
}
