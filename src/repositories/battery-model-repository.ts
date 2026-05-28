import { BaseRepository } from "@/repositories/base-repository"
import { AppError } from "@/lib/errors/app-error"
import type {
  BatteryModel,
  BatteryModelInsert,
  BatteryModelUpdate
} from "@/types/battery-model"

export class BatteryModelRepository extends BaseRepository {
  async findAll(onlyActive = true): Promise<BatteryModel[]> {
    const client = await this.getClient()

    let query = client.from("battery_models").select("*").order("name", {
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

  async findById(id: string): Promise<BatteryModel | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("battery_models")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: BatteryModelInsert): Promise<BatteryModel> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("battery_models")
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
    input: BatteryModelUpdate,
    expectedUpdatedAt?: string
  ): Promise<BatteryModel> {
    const client = await this.getClient()

    let query = client.from("battery_models").update(input).eq("id", id)
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
      .from("battery_models")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      throw error
    }
  }
}
