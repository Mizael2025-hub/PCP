import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  OxideMillListFilters,
  OxideMillProduction,
  OxideMillProductionInsert,
  OxideMillProductionUpdate
} from "@/types/oxide-mill-production"

export class OxideMillProductionRepository extends BaseRepository {
  async findAll(
    filters?: OxideMillListFilters
  ): Promise<OxideMillProduction[]> {
    const client = await this.getClient()

    let query = client
      .from("oxide_mill_production")
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

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<OxideMillProduction | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("oxide_mill_production")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: OxideMillProductionInsert): Promise<OxideMillProduction> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("oxide_mill_production")
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
    input: OxideMillProductionUpdate,
    expectedUpdatedAt?: string
  ): Promise<OxideMillProduction> {
    const client = await this.getClient()

    let query = client.from("oxide_mill_production").update(input).eq("id", id)
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
