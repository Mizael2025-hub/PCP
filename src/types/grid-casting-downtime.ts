import type { Database } from "@/lib/supabase/database.types"

import type { GridCastingProductionWithRelations } from "@/types/grid-casting"

export type GridCastingDowntime =
  Database["public"]["Tables"]["grid_casting_downtime"]["Row"]

export type GridCastingDowntimeInsert =
  Database["public"]["Tables"]["grid_casting_downtime"]["Insert"]

export type GridCastingDowntimeUpdate =
  Database["public"]["Tables"]["grid_casting_downtime"]["Update"]

export type GridCastingDowntimeWithProduction = GridCastingDowntime & {
  production: GridCastingProductionWithRelations | null
}

export type GridCastingDowntimeListFilters = {
  dateFrom?: string
  dateTo?: string
  shiftId?: string
  productionId?: string
}
