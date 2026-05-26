import type { Database } from "@/lib/supabase/database.types"

export type GridCastingProduction =
  Database["public"]["Tables"]["grid_casting_production"]["Row"]

export type GridCastingProductionInsert =
  Database["public"]["Tables"]["grid_casting_production"]["Insert"]

export type GridCastingProductionUpdate =
  Database["public"]["Tables"]["grid_casting_production"]["Update"]

export type GridCastingShiftRef = {
  id: string
  name: string
}

export type GridCastingMachineRef = {
  id: string
  name: string
  sector_id: string | null
}

export type GridCastingEmployeeRef = {
  id: string
  name: string
  sector_id: string | null
}

export type GridCastingLeadAlloyRef = {
  id: string
  code: string
  description: string | null
}

export type GridCastingBatteryModelRef = {
  id: string
  code: string
  name: string
  weight_specification: number
}

export type GridCastingProductionWithRelations = GridCastingProduction & {
  shifts: GridCastingShiftRef | null
  machines: GridCastingMachineRef | null
  employees: GridCastingEmployeeRef | null
  lead_alloys: GridCastingLeadAlloyRef | null
  battery_models: GridCastingBatteryModelRef | null
}

export type GridCastingListFilters = {
  dateFrom?: string
  dateTo?: string
  shiftId?: string
}
