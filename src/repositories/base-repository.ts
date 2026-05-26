import { type TypedSupabaseClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"

export type SupabaseServerClient = TypedSupabaseClient

export abstract class BaseRepository {
  protected async getClient(): Promise<SupabaseServerClient> {
    return createClient()
  }
}
