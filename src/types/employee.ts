import type { Database } from "@/lib/supabase/database.types"

export type Employee = Database["public"]["Tables"]["employees"]["Row"]

export type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"]

export type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"]

export type EmployeeSectorRef = {
  id: string
  name: string
}

export type EmployeeWithSector = Employee & {
  sectors: EmployeeSectorRef | null
}
