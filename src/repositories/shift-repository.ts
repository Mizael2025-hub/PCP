import { BaseRepository } from "@/repositories/base-repository"
import type { Shift, ShiftInsert, ShiftUpdate } from "@/types/shift"

export class ShiftRepository extends BaseRepository {
  async findAll(): Promise<Shift[]> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("shifts")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<Shift | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("shifts")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: ShiftInsert): Promise<Shift> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("shifts")
      .insert(input)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async update(id: string, input: ShiftUpdate): Promise<Shift> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("shifts")
      .update(input)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async remove(id: string): Promise<void> {
    const client = await this.getClient()

    const { error } = await client.from("shifts").delete().eq("id", id)

    if (error) {
      throw error
    }
  }
}
