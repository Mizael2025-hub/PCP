import { BaseRepository } from "@/repositories/base-repository"
import type {
  MixerListFilters,
  MixerProduction,
  MixerProductionInsert,
  MixerProductionUpdate
} from "@/types/mixer-production"

export class MixerProductionRepository extends BaseRepository {
  async findAll(filters?: MixerListFilters): Promise<MixerProduction[]> {
    const client = await this.getClient()

    let query = client
      .from("mixer_production")
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

    if (filters?.batchNumber) {
      query = query.eq("batch_number", filters.batchNumber)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<MixerProduction | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("mixer_production")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: MixerProductionInsert): Promise<MixerProduction> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("mixer_production")
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
    input: MixerProductionUpdate
  ): Promise<MixerProduction> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("mixer_production")
      .update(input)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }
}
