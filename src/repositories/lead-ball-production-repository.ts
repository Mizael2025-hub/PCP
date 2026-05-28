import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  LeadBallListFilters,
  LeadBallProduction,
  LeadBallProductionInsert,
  LeadBallProductionUpdate
} from "@/types/lead-ball-production"

export class LeadBallProductionRepository extends BaseRepository {
  async findAll(filters?: LeadBallListFilters): Promise<LeadBallProduction[]> {
    const client = await this.getClient()

    let query = client
      .from("lead_ball_production")
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

    if (filters?.siloNumber !== undefined) {
      query = query.eq("silo_number", filters.siloNumber)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<LeadBallProduction | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lead_ball_production")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: LeadBallProductionInsert): Promise<LeadBallProduction> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lead_ball_production")
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
    input: LeadBallProductionUpdate,
    expectedUpdatedAt?: string
  ): Promise<LeadBallProduction> {
    const client = await this.getClient()

    let query = client.from("lead_ball_production").update(input).eq("id", id)
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
