import { BaseRepository } from "@/repositories/base-repository"
import type {
  AssemblyListFilters,
  AssemblyProduction,
  AssemblyProductionInsert,
  AssemblyProductionUpdate
} from "@/types/assembly-production"

export class AssemblyProductionRepository extends BaseRepository {
  async findAll(filters?: AssemblyListFilters): Promise<AssemblyProduction[]> {
    const client = await this.getClient()

    let query = client
      .from("assembly_production")
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

    if (filters?.batteryLotCode) {
      query = query.ilike("battery_lot_code", `%${filters.batteryLotCode}%`)
    }

    if (filters?.pastingProductionIds?.length) {
      query = query.in("pasting_production_id", filters.pastingProductionIds)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<AssemblyProduction | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("assembly_production")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async findByBatteryLotCode(
    batteryLotCode: string
  ): Promise<AssemblyProduction | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("assembly_production")
      .select("*")
      .eq("battery_lot_code", batteryLotCode)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async findLinkedPastingIds(excludeAssemblyId?: string): Promise<string[]> {
    const client = await this.getClient()

    let query = client
      .from("assembly_production")
      .select("pasting_production_id")

    if (excludeAssemblyId) {
      query = query.neq("id", excludeAssemblyId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return (data ?? []).map((row) => row.pasting_production_id)
  }

  async countByDateAndPastingModel(
    date: string,
    batteryModelId: string
  ): Promise<number> {
    const client = await this.getClient()

    const { data: pastingRows, error: pastingError } = await client
      .from("pasting_production")
      .select("id")
      .eq("battery_model_id", batteryModelId)

    if (pastingError) {
      throw pastingError
    }

    const pastingIds = (pastingRows ?? []).map((row) => row.id)

    if (pastingIds.length === 0) {
      return 0
    }

    const { count, error } = await client
      .from("assembly_production")
      .select("*", { count: "exact", head: true })
      .eq("date", date)
      .in("pasting_production_id", pastingIds)

    if (error) {
      throw error
    }

    return count ?? 0
  }

  async create(input: AssemblyProductionInsert): Promise<AssemblyProduction> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("assembly_production")
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
    input: AssemblyProductionUpdate
  ): Promise<AssemblyProduction> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("assembly_production")
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
