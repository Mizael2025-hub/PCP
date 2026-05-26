import { BaseRepository } from "@/repositories/base-repository"
import type {
  LabQualityControl,
  LabQualityControlInsert,
  LabQualityControlListFilters,
  LabQualityControlUpdate
} from "@/types/lab-quality-control"

export class LabQualityControlRepository extends BaseRepository {
  async findAll(
    filters?: LabQualityControlListFilters
  ): Promise<LabQualityControl[]> {
    const client = await this.getClient()

    let query = client
      .from("lab_quality_control")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (filters?.dateFrom) {
      query = query.gte("date", filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte("date", filters.dateTo)
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<LabQualityControl | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lab_quality_control")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: LabQualityControlInsert): Promise<LabQualityControl> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lab_quality_control")
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
    input: LabQualityControlUpdate
  ): Promise<LabQualityControl> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("lab_quality_control")
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
