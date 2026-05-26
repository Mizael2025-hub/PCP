import { BaseRepository } from "@/repositories/base-repository"
import type {
  FormationDetail,
  FormationDetailInsert
} from "@/types/formation-record"

export class FormationDetailRepository extends BaseRepository {
  async findByFormationId(formationId: string): Promise<FormationDetail[]> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("formation_details")
      .select("*")
      .eq("formation_id", formationId)
      .order("circuit_number", { ascending: true })

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findByFormationIds(formationIds: string[]): Promise<FormationDetail[]> {
    const uniqueIds = [...new Set(formationIds)]

    if (uniqueIds.length === 0) {
      return []
    }

    const client = await this.getClient()

    const { data, error } = await client
      .from("formation_details")
      .select("*")
      .in("formation_id", uniqueIds)
      .order("circuit_number", { ascending: true })

    if (error) {
      throw error
    }

    return data ?? []
  }

  async replaceForFormation(
    formationId: string,
    lines: Omit<FormationDetailInsert, "formation_id">[]
  ): Promise<FormationDetail[]> {
    const client = await this.getClient()

    const { error: deleteError } = await client
      .from("formation_details")
      .delete()
      .eq("formation_id", formationId)

    if (deleteError) {
      throw deleteError
    }

    if (lines.length === 0) {
      return []
    }

    const payload = lines.map((line) => ({
      ...line,
      formation_id: formationId
    }))

    const { data, error } = await client
      .from("formation_details")
      .insert(payload)
      .select("*")

    if (error) {
      throw error
    }

    return data ?? []
  }
}
