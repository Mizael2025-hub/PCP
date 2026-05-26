import type { Database } from "@/lib/supabase/database.types"

export type LeadBallProduction =
  Database["public"]["Tables"]["lead_ball_production"]["Row"]

export type LeadBallProductionInsert =
  Database["public"]["Tables"]["lead_ball_production"]["Insert"]

export type LeadBallProductionUpdate =
  Database["public"]["Tables"]["lead_ball_production"]["Update"]

export type LeadBallShiftRef = {
  id: string
  name: string
}

export type LeadBallEmployeeRef = {
  id: string
  name: string
}

export type LeadBallProductionWithRelations = LeadBallProduction & {
  shifts: LeadBallShiftRef | null
  employees: LeadBallEmployeeRef | null
}

export type LeadBallListFilters = {
  dateFrom?: string
  dateTo?: string
  shiftId?: string
  siloNumber?: number
}
