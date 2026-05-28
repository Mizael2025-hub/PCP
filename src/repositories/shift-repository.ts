import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type { Shift, ShiftInsert, ShiftUpdate } from "@/types/shift"

export class ShiftRepository extends BaseRepository {
  async findAll(onlyActive = true): Promise<Shift[]> {
    const client = await this.getClient()

    let query = client.from("shifts").select("*").order("name", {
      ascending: true
    })

    if (onlyActive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

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

  async update(
    id: string,
    input: ShiftUpdate,
    expectedUpdatedAt?: string
  ): Promise<Shift> {
    const client = await this.getClient()

    let query = client.from("shifts").update(input).eq("id", id)
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

  async remove(id: string): Promise<void> {
    const client = await this.getClient()

    const { error } = await client
      .from("shifts")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      throw error
    }
  }
}
