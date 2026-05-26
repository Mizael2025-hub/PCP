import { BaseRepository } from "@/repositories/base-repository"
import type { Sector, SectorInsert, SectorUpdate } from "@/types/sector"

export class SectorRepository extends BaseRepository {
  async findAll(onlyActive = true): Promise<Sector[]> {
    const client = await this.getClient()

    let query = client
      .from("sectors")
      .select("*")
      .order("name", { ascending: true })

    if (onlyActive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<Sector | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("sectors")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: SectorInsert): Promise<Sector> {
    const client = await this.getClient()

    const payload: SectorInsert = {
      name: input.name,
      is_active: input.is_active ?? true
    }

    const { data, error } = await client
      .from("sectors")
      .insert(payload)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async update(id: string, input: SectorUpdate): Promise<Sector> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("sectors")
      .update(input)
      .eq("id", id)
      .eq("is_active", true)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async softDelete(id: string): Promise<void> {
    const client = await this.getClient()

    const { error } = await client
      .from("sectors")
      .update({ is_active: false })
      .eq("id", id)
      .eq("is_active", true)

    if (error) {
      throw error
    }
  }
}
