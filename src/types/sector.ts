import type { Database } from "@/lib/supabase/database.types"

export type Sector = Database["public"]["Tables"]["sectors"]["Row"]

export type SectorInsert = Database["public"]["Tables"]["sectors"]["Insert"]

export type SectorUpdate = Database["public"]["Tables"]["sectors"]["Update"]
