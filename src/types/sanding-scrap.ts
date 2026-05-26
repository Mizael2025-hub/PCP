import type { Database } from "@/lib/supabase/database.types"

export type SandingScrap = Database["public"]["Tables"]["sanding_scrap"]["Row"]

export type SandingScrapInsert =
  Database["public"]["Tables"]["sanding_scrap"]["Insert"]

export type SandingScrapUpdate =
  Database["public"]["Tables"]["sanding_scrap"]["Update"]

export type SandingScrapEmployeeRef = {
  id: string
  name: string
}

export type SandingScrapWithRelations = SandingScrap & {
  employees: SandingScrapEmployeeRef | null
}

export type SandingScrapListFilters = {
  dateFrom?: string
  dateTo?: string
  operatorId?: string
}

export type SandingScrapDailySummary = {
  date: string
  totalScrapWeight: number
  totalPlatesLost: number
  recordCount: number
}

export type SandingScrapOperatorSummary = {
  id: string
  label: string
  totalScrapWeight: number
  totalPlatesLost: number
  recordCount: number
}
