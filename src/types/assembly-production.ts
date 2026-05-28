import type { Database, Json } from "@/lib/supabase/database.types"

export type AssemblyProduction =
  Database["public"]["Tables"]["assembly_production"]["Row"]

export type AssemblyProductionInsert =
  Database["public"]["Tables"]["assembly_production"]["Insert"]

export type AssemblyProductionUpdate =
  Database["public"]["Tables"]["assembly_production"]["Update"]

export type AssemblyShiftRef = {
  id: string
  name: string
}

export type AssemblyMachineRef = {
  id: string
  name: string
  sector_id: string | null
}

export type AssemblyEmployeeRef = {
  id: string
  name: string
  sector_id: string | null
}

export type AssemblyPastingRef = {
  id: string
  ep_code: string
  date: string
  battery_model_id: string
  plates_qty: number
  created_at: string
  updated_at: string
  created_by: string | null
}

export type AssemblyBatteryModelRef = {
  id: string
  code: string
  name: string
}

export type AssemblyProductionWithRelations = AssemblyProduction & {
  shifts: AssemblyShiftRef | null
  machines: AssemblyMachineRef | null
  employees: AssemblyEmployeeRef | null
  pasting_production: AssemblyPastingRef | null
  battery_models: AssemblyBatteryModelRef | null
  lot_characteristics: Json
}

export type AssemblyListFilters = {
  dateFrom?: string
  dateTo?: string
  shiftId?: string
  batteryLotCode?: string
  epCode?: string
  pastingProductionIds?: string[]
}
