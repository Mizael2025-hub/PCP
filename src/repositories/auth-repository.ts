import { BaseRepository } from "@/repositories/base-repository"
import type { Profile } from "@/types/auth"

export class AuthRepository extends BaseRepository {
  async signInWithPassword(email: string, password: string) {
    const client = await this.getClient()

    return client.auth.signInWithPassword({ email, password })
  }

  async signOut() {
    const client = await this.getClient()

    return client.auth.signOut()
  }

  async getUser() {
    const client = await this.getClient()

    return client.auth.getUser()
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const client = await this.getClient()

    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }
}
