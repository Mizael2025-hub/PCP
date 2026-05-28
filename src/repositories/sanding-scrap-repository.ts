import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  SandingScrap,
  SandingScrapInsert,
  SandingScrapListFilters,
  SandingScrapUpdate
} from "@/types/sanding-scrap"

export class SandingScrapRepository extends BaseRepository {
  async findAll(filters?: SandingScrapListFilters): Promise<SandingScrap[]> {
    const client = await this.getClient()

    let query = client
      .from("sanding_scrap")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (filters?.dateFrom) {
      query = query.gte("date", filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte("date", filters.dateTo)
    }

    if (filters?.operatorId) {
      query = query.eq("operator_id", filters.operatorId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<SandingScrap | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("sanding_scrap")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: SandingScrapInsert): Promise<SandingScrap> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("sanding_scrap")
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
    input: SandingScrapUpdate,
    expectedUpdatedAt?: string
  ): Promise<SandingScrap> {
    const client = await this.getClient()

    let query = client.from("sanding_scrap").update(input).eq("id", id)
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
