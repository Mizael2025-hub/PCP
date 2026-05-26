import { BaseRepository } from "@/repositories/base-repository"
import type { Employee, EmployeeInsert, EmployeeUpdate } from "@/types/employee"

export class EmployeeRepository extends BaseRepository {
  async findAll(onlyActive = true): Promise<Employee[]> {
    const client = await this.getClient()

    let query = client
      .from("employees")
      .select("*")
      .order("name", { ascending: true })

    if (onlyActive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findById(id: string): Promise<Employee | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("employees")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  async create(input: EmployeeInsert): Promise<Employee> {
    const client = await this.getClient()

    const payload: EmployeeInsert = {
      name: input.name,
      registration_code: input.registration_code,
      sector_id: input.sector_id ?? null,
      is_active: input.is_active ?? true
    }

    const { data, error } = await client
      .from("employees")
      .insert(payload)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async update(id: string, input: EmployeeUpdate): Promise<Employee> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("employees")
      .update(input)
      .eq("id", id)
      .eq("is_active", true)
      .select("*")
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async softDelete(id: string): Promise<void> {
    const client = await this.getClient()

    const { error } = await client
      .from("employees")
      .update({ is_active: false })
      .eq("id", id)
      .eq("is_active", true)

    if (error) {
      throw error
    }
  }
}
