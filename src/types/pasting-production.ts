import type { Database } from "@/lib/supabase/database.types"

export type PastingProduction =
  Database["public"]["Tables"]["pasting_production"]["Row"]

export type PastingProductionInsert =
  Database["public"]["Tables"]["pasting_production"]["Insert"]

export type PastingProductionUpdate =
  Database["public"]["Tables"]["pasting_production"]["Update"]

export type PastingShiftRef = {
  id: string
  name: string
}

export type PastingMachineRef = {
  id: string
  name: string
  sector_id: string | null
}

export type PastingEmployeeRef = {
  id: string
  name: string
  sector_id: string | null
}

export type PastingBatteryModelRef = {
  id: string
  code: string
  name: string
  weight_specification: number
}

export type PastingProductionWithRelations = PastingProduction & {
  shifts: PastingShiftRef | null
  machines: PastingMachineRef | null
  employees: PastingEmployeeRef | null
  battery_models: PastingBatteryModelRef | null
}

export type PastingListFilters = {
  dateFrom?: string
  dateTo?: string
  shiftId?: string
  epCode?: string
  batteryModelId?: string
}
