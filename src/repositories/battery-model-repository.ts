import { BaseRepository } from "@/repositories/base-repository"
import type {
  BatteryModel,
  BatteryModelInsert,
  BatteryModelUpdate
} from "@/types/battery-model"

export class BatteryModelRepository extends BaseRepository {
  async findAll(): Promise<BatteryModel[]> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("battery_models")
      .select("*")
      .order("name", { ascending: true })

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

  async update(id: string, input: BatteryModelUpdate): Promise<BatteryModel> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("battery_models")
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

    const { error } = await client.from("battery_models").delete().eq("id", id)

    if (error) {
      throw error
    }
  }
}
