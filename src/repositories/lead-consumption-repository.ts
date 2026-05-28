import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  LeadConsumption,
  LeadConsumptionInsert,
  LeadConsumptionListFilters,
  LeadConsumptionUpdate
} from "@/types/lead-consumption"

export class LeadConsumptionRepository extends BaseRepository {
  async findAll(
    filters?: LeadConsumptionListFilters
  ): Promise<LeadConsumption[]> {
    const client = await this.getClient()

    let query = client
      .from("lead_consumption")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (filters?.dateFrom) {
      query = query.gte("date", filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte("date", filters.dateTo)
    }

    if (filters?.alloyId) {
      query = query.eq("alloy_id", filters.alloyId)
    }

    if (filters?.destinationSectorId) {
      query = query.eq("destination_sector_id", filters.destinationSectorId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<LeadConsumption | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lead_consumption")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: LeadConsumptionInsert): Promise<LeadConsumption> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lead_consumption")
      .insert(input)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async update(
    id: string,
    input: LeadConsumptionUpdate,
    expectedUpdatedAt?: string
  ): Promise<LeadConsumption> {
    const client = await this.getClient()

    let query = client.from("lead_consumption").update(input).eq("id", id)
    if (expectedUpdatedAt) {
      query = query.eq("updated_at", expectedUpdatedAt)
    }

    const { data, error } = await query.select("*").maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      throw AppError.conflict(
        "Registro foi alterado por outra pessoa. Recarregue e tente novamente."
      )
    }

    return data
  }
}
