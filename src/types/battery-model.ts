import type { Database } from "@/lib/supabase/database.types"

export type BatteryModel = Database["public"]["Tables"]["battery_models"]["Row"]

export type BatteryModelInsert =
  Database["public"]["Tables"]["battery_models"]["Insert"]

export type BatteryModelUpdate =
  Database["public"]["Tables"]["battery_models"]["Update"]
