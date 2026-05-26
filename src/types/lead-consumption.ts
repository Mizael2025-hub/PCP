import type { Database } from "@/lib/supabase/database.types"

export type LeadConsumption =
  Database["public"]["Tables"]["lead_consumption"]["Row"]

export type LeadConsumptionInsert =
  Database["public"]["Tables"]["lead_consumption"]["Insert"]

export type LeadConsumptionUpdate =
  Database["public"]["Tables"]["lead_consumption"]["Update"]

export type LeadConsumptionAlloyRef = {
  id: string
  code: string
  description: string | null
}

export type LeadConsumptionSectorRef = {
  id: string
  name: string
}

export type LeadConsumptionWithRelations = LeadConsumption & {
  lead_alloys: LeadConsumptionAlloyRef | null
  sectors: LeadConsumptionSectorRef | null
}

export type LeadConsumptionListFilters = {
  dateFrom?: string
  dateTo?: string
  alloyId?: string
  destinationSectorId?: string
}

export type LeadConsumptionDailySummary = {
  date: string
  totalWeight: number
  recordCount: number
}

export type LeadConsumptionGroupSummary = {
  id: string
  label: string
  totalWeight: number
  recordCount: number
}
