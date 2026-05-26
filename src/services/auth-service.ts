import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { AuthRepository } from "@/repositories/auth-repository"
import { BaseService } from "@/services/base-service"
import type { AuthSession } from "@/types/auth"
import type { LoginSchema } from "@/validations/auth/login-schema"

export class AuthService extends BaseService {
  private readonly repository = new AuthRepository()

  async login(
    input: LoginSchema
  ): Promise<ActionResponse<Pick<AuthSession, "profile">>> {
    try {
      const { data, error } = await this.repository.signInWithPassword(
        input.email,
        input.password
      )

      if (error || !data.user) {
        throw AppError.unauthorized("E-mail ou senha inválidos.")
      }

      const profile = await this.repository.getProfile(data.user.id)

      if (!profile) {
        await this.repository.signOut()
        throw AppError.unauthorized("Perfil não encontrado.")
      }

      if (!profile.is_active) {
        await this.repository.signOut()
        throw AppError.unauthorized("Usuário inativo.")
      }

      return actionSuccess({ profile })
    } catch (error) {
      return this.handleError("AuthService.login", error)
    }
  }

  async logout(): Promise<ActionResponse> {
    try {
      const { error } = await this.repository.signOut()

      if (error) {
        throw error
      }

      return actionSuccess(undefined, "Sessão encerrada.")
    } catch (error) {
      return this.handleError("AuthService.logout", error)
    }
  }

  async getSession(): Promise<ActionResponse<AuthSession | null>> {
    try {
      const {
        data: { user },
        error
      } = await this.repository.getUser()

      if (error) {
        throw error
      }

      if (!user) {
        return actionSuccess(null)
      }

      const profile = await this.repository.getProfile(user.id)

      if (!profile || !profile.is_active) {
        await this.repository.signOut()
        return actionSuccess(null)
      }

      return actionSuccess({ user, profile })
    } catch (error) {
      return this.handleError("AuthService.getSession", error)
    }
  }
}
