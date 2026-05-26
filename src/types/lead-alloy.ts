import type { Database } from "@/lib/supabase/database.types"

export type LeadAlloy = Database["public"]["Tables"]["lead_alloys"]["Row"]

export type LeadAlloyInsert =
  Database["public"]["Tables"]["lead_alloys"]["Insert"]

export type LeadAlloyUpdate =
  Database["public"]["Tables"]["lead_alloys"]["Update"]
