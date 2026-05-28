import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  PastingListFilters,
  PastingProduction,
  PastingProductionInsert,
  PastingProductionUpdate
} from "@/types/pasting-production"

export class PastingProductionRepository extends BaseRepository {
  async findAll(filters?: PastingListFilters): Promise<PastingProduction[]> {
    const client = await this.getClient()

    let query = client
      .from("pasting_production")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (filters?.dateFrom) {
      query = query.gte("date", filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte("date", filters.dateTo)
    }

    if (filters?.shiftId) {
      query = query.eq("shift_id", filters.shiftId)
    }

    if (filters?.epCode) {
      query = query.ilike("ep_code", `%${filters.epCode}%`)
    }

    if (filters?.batteryModelId) {
      query = query.eq("battery_model_id", filters.batteryModelId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<PastingProduction | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("pasting_production")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async findByEpCode(epCode: string): Promise<PastingProduction | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("pasting_production")
      .select("*")
      .eq("ep_code", epCode)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async countByDateAndModel(
    date: string,
    batteryModelId: string
  ): Promise<number> {
    const client = await this.getClient()

    const { count, error } = await client
      .from("pasting_production")
      .select("*", { count: "exact", head: true })
      .eq("date", date)
      .eq("battery_model_id", batteryModelId)

    if (error) {
      throw error
    }

    return count ?? 0
  }

  async create(input: PastingProductionInsert): Promise<PastingProduction> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("pasting_production")
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
    input: PastingProductionUpdate,
    expectedUpdatedAt?: string
  ): Promise<PastingProduction> {
    const client = await this.getClient()

    let query = client.from("pasting_production").update(input).eq("id", id)
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
