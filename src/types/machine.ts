import type { Database } from "@/lib/supabase/database.types"

export type Machine = Database["public"]["Tables"]["machines"]["Row"]

export type MachineInsert = Database["public"]["Tables"]["machines"]["Insert"]

export type MachineUpdate = Database["public"]["Tables"]["machines"]["Update"]

export type MachineSectorRef = {
  id: string
  name: string
}

export type MachineWithSector = Machine & {
  sectors: MachineSectorRef | null
}
