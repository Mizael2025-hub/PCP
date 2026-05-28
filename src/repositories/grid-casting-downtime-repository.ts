import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  GridCastingDowntime,
  GridCastingDowntimeInsert,
  GridCastingDowntimeListFilters,
  GridCastingDowntimeUpdate
} from "@/types/grid-casting-downtime"

export class GridCastingDowntimeRepository extends BaseRepository {
  async findAll(productionIds?: string[]): Promise<GridCastingDowntime[]> {
    const client = await this.getClient()

    let query = client
      .from("grid_casting_downtime")
      .select("*")
      .order("start_time", { ascending: false })

    if (productionIds !== undefined) {
      if (productionIds.length === 0) {
        return []
      }

      query = query.in("production_id", productionIds)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findByProductionIds(
    filters: GridCastingDowntimeListFilters,
    productionIds: string[]
  ): Promise<GridCastingDowntime[]> {
    if (productionIds.length === 0) {
      return []
    }

    const client = await this.getClient()

    let query = client
      .from("grid_casting_downtime")
      .select("*")
      .in("production_id", productionIds)
      .order("start_time", { ascending: false })

    if (filters.productionId) {
      query = query.eq("production_id", filters.productionId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<GridCastingDowntime | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("grid_casting_downtime")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: GridCastingDowntimeInsert): Promise<GridCastingDowntime> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("grid_casting_downtime")
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
    input: GridCastingDowntimeUpdate,
    expectedUpdatedAt?: string
  ): Promise<GridCastingDowntime> {
    const client = await this.getClient()

    let query = client.from("grid_casting_downtime").update(input).eq("id", id)
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
