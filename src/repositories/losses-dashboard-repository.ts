import { BaseRepository } from "@/repositories/base-repository"
import type { LossesPeriodFilters } from "@/types/losses-dashboard"

export type LossesSandingRow = {
  date: string
  operator_id: string
  scrap_weight: number
  plates_qty_lost: number
}

export type LossesPastingRow = {
  date: string
  battery_model_id: string
  plates_qty: number
}

export type LossesRawData = {
  sandingScrap: LossesSandingRow[]
  pastingProduction: LossesPastingRow[]
}

export class LossesDashboardRepository extends BaseRepository {
  async fetchRawData(filters: LossesPeriodFilters): Promise<LossesRawData> {
    const client = await this.getClient()

    const sandingScrapQuery = client
      .from("sanding_scrap")
      .select("date, operator_id, scrap_weight, plates_qty_lost")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    const pastingProductionQuery = client
      .from("pasting_production")
      .select("date, battery_model_id, plates_qty")
      .gte("date", filters.dateFrom)
      .lte("date", filters.dateTo)

    const [sandingResult, pastingResult] = await Promise.all([
      sandingScrapQuery,
      pastingProductionQuery
    ])

    if (sandingResult.error) {
      throw sandingResult.error
    }

    if (pastingResult.error) {
      throw pastingResult.error
    }

    return {
      sandingScrap: (sandingResult.data ?? []) as LossesSandingRow[],
      pastingProduction: (pastingResult.data ?? []) as LossesPastingRow[]
    }
  }
}
