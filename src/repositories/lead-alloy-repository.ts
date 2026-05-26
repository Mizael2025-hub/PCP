import { BaseRepository } from "@/repositories/base-repository"
import type {
  LeadAlloy,
  LeadAlloyInsert,
  LeadAlloyUpdate
} from "@/types/lead-alloy"

export class LeadAlloyRepository extends BaseRepository {
  async findAll(): Promise<LeadAlloy[]> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lead_alloys")
      .select("*")
      .order("code", { ascending: true })

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

  async update(id: string, input: LeadAlloyUpdate): Promise<LeadAlloy> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lead_alloys")
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

    const { error } = await client.from("lead_alloys").delete().eq("id", id)

    if (error) {
      throw error
    }
  }
}
