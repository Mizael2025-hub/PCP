import { BaseRepository } from "@/repositories/base-repository"
import type { Machine, MachineInsert, MachineUpdate } from "@/types/machine"

export class MachineRepository extends BaseRepository {
  async findAll(onlyActive = true): Promise<Machine[]> {
    const client = await this.getClient()

    let query = client
      .from("machines")
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

  async findById(id: string): Promise<Machine | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("machines")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: MachineInsert): Promise<Machine> {
    const client = await this.getClient()

    const payload: MachineInsert = {
      name: input.name,
      sector_id: input.sector_id ?? null,
      is_active: input.is_active ?? true
    }

    const { data, error } = await client
      .from("machines")
      .insert(payload)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async update(id: string, input: MachineUpdate): Promise<Machine> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("machines")
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
      .from("machines")
      .update({ is_active: false })
      .eq("id", id)
      .eq("is_active", true)

    if (error) {
      throw error
    }
  }
}
