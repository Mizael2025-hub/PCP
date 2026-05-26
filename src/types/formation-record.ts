import type { Database } from "@/lib/supabase/database.types"

export type FormationRecord =
  Database["public"]["Tables"]["formation_records"]["Row"]

export type FormationRecordInsert =
  Database["public"]["Tables"]["formation_records"]["Insert"]

export type FormationRecordUpdate =
  Database["public"]["Tables"]["formation_records"]["Update"]

export type FormationDetail =
  Database["public"]["Tables"]["formation_details"]["Row"]

export type FormationDetailInsert =
  Database["public"]["Tables"]["formation_details"]["Insert"]

export const FORMATION_STATUSES = ["IN_PROGRESS", "COMPLETED"] as const

export type FormationStatus = (typeof FORMATION_STATUSES)[number]

export type FormationEmployeeRef = {
  id: string
  name: string
}

export type FormationRecordWithRelations = FormationRecord & {
  employees: FormationEmployeeRef | null
  details: FormationDetail[]
}

export type FormationListFilters = {
  dateFrom?: string
  dateTo?: string
  status?: FormationStatus
  operatorId?: string
}
