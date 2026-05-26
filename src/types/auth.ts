import type { User } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export type AuthSession = {
  user: User
  profile: Profile
}
