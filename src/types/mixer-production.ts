import type { Database } from "@/lib/supabase/database.types"

export type MixerProduction =
  Database["public"]["Tables"]["mixer_production"]["Row"]

export type MixerProductionInsert =
  Database["public"]["Tables"]["mixer_production"]["Insert"]

export type MixerProductionUpdate =
  Database["public"]["Tables"]["mixer_production"]["Update"]

export type MixerShiftRef = {
  id: string
  name: string
}

export type MixerEmployeeRef = {
  id: string
  name: string
}

export type MixerProductionWithRelations = MixerProduction & {
  shifts: MixerShiftRef | null
  employees: MixerEmployeeRef | null
}

export type MixerListFilters = {
  dateFrom?: string
  dateTo?: string
  shiftId?: string
  batchNumber?: string
}
