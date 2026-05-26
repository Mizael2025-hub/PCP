import type { Database } from "@/lib/supabase/database.types"

export type OxideMillProduction =
  Database["public"]["Tables"]["oxide_mill_production"]["Row"]

export type OxideMillProductionInsert =
  Database["public"]["Tables"]["oxide_mill_production"]["Insert"]

export type OxideMillProductionUpdate =
  Database["public"]["Tables"]["oxide_mill_production"]["Update"]

export type OxideMillShiftRef = {
  id: string
  name: string
}

export type OxideMillEmployeeRef = {
  id: string
  name: string
}

export type OxideMillProductionWithRelations = OxideMillProduction & {
  shifts: OxideMillShiftRef | null
  employees: OxideMillEmployeeRef | null
}

export type OxideMillListFilters = {
  dateFrom?: string
  dateTo?: string
  shiftId?: string
}

export type OxideMillDailySummary = {
  date: string
  totalOxideWeight: number
  averageOxidationDegree: number
  recordCount: number
}
