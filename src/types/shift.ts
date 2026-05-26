import type { Database } from "@/lib/supabase/database.types"

export type Shift = Database["public"]["Tables"]["shifts"]["Row"]

export type ShiftInsert = Database["public"]["Tables"]["shifts"]["Insert"]

export type ShiftUpdate = Database["public"]["Tables"]["shifts"]["Update"]
