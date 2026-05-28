import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  LeadAlloy,
  LeadAlloyInsert,
  LeadAlloyUpdate
} from "@/types/lead-alloy"

export class LeadAlloyRepository extends BaseRepository {
  async findAll(onlyActive = true): Promise<LeadAlloy[]> {
    const client = await this.getClient()

    let query = client.from("lead_alloys").select("*").order("code", {
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

  async findById(id: string): Promise<LeadAlloy | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lead_alloys")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: LeadAlloyInsert): Promise<LeadAlloy> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lead_alloys")
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
    input: LeadAlloyUpdate,
    expectedUpdatedAt?: string
  ): Promise<LeadAlloy> {
    const client = await this.getClient()

    let query = client.from("lead_alloys").update(input).eq("id", id)
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
      .from("lead_alloys")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      throw error
    }
  }
}
