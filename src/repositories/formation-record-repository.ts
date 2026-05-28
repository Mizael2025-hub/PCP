import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  FormationListFilters,
  FormationRecord,
  FormationRecordInsert,
  FormationRecordUpdate
} from "@/types/formation-record"

export class FormationRecordRepository extends BaseRepository {
  async findAll(filters?: FormationListFilters): Promise<FormationRecord[]> {
    const client = await this.getClient()

    let query = client
      .from("formation_records")
      .select("*")
      .order("start_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (filters?.dateFrom) {
      query = query.gte("start_date", `${filters.dateFrom}T00:00:00`)
    }

    if (filters?.dateTo) {
      query = query.lte("start_date", `${filters.dateTo}T23:59:59`)
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
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

  async findById(id: string): Promise<FormationRecord | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("formation_records")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async countByStartDate(date: string): Promise<number> {
    const client = await this.getClient()

    const { count, error } = await client
      .from("formation_records")
      .select("*", { count: "exact", head: true })
      .gte("start_date", `${date}T00:00:00`)
      .lte("start_date", `${date}T23:59:59`)

    if (error) {
      throw error
    }

    return count ?? 0
  }

  async create(input: FormationRecordInsert): Promise<FormationRecord> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("formation_records")
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
    input: FormationRecordUpdate,
    expectedUpdatedAt?: string
  ): Promise<FormationRecord> {
    const client = await this.getClient()

    let query = client.from("formation_records").update(input).eq("id", id)
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
