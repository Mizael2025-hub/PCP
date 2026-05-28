import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  GridCastingListFilters,
  GridCastingProduction,
  GridCastingProductionInsert,
  GridCastingProductionUpdate
} from "@/types/grid-casting"

export class GridCastingProductionRepository extends BaseRepository {
  async findAll(
    filters?: GridCastingListFilters
  ): Promise<GridCastingProduction[]> {
    const client = await this.getClient()

    let query = client
      .from("grid_casting_production")
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

  async findById(id: string): Promise<GridCastingProduction | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("grid_casting_production")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(
    input: GridCastingProductionInsert
  ): Promise<GridCastingProduction> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("grid_casting_production")
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
    input: GridCastingProductionUpdate,
    expectedUpdatedAt?: string
  ): Promise<GridCastingProduction> {
    const client = await this.getClient()

    let query = client
      .from("grid_casting_production")
      .update(input)
      .eq("id", id)
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
