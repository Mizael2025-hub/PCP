import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { LeadAlloyRepository } from "@/repositories/lead-alloy-repository"
import { BaseService } from "@/services/base-service"
import type { LeadAlloy } from "@/types/lead-alloy"
import type {
  CreateLeadAlloySchema,
  UpdateLeadAlloySchema
} from "@/validations/lead-alloys/lead-alloy-schema"

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  )
}

export class LeadAlloyService extends BaseService {
  private readonly repository = new LeadAlloyRepository()

  async list(): Promise<ActionResponse<LeadAlloy[]>> {
    try {
      const leadAlloys = await this.repository.findAll(true)
      return actionSuccess(leadAlloys)
    } catch (error) {
      return this.handleError("LeadAlloyService.list", error)
    }
  }

  async create(
    input: CreateLeadAlloySchema
  ): Promise<ActionResponse<LeadAlloy>> {
    try {
      const leadAlloy = await this.repository.create({
        code: input.code,
        description: input.description
      })

      return actionSuccess(leadAlloy, "Liga criada com sucesso.")
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "LeadAlloyService.create",
          AppError.badRequest("Já existe uma liga com este código.")
        )
      }

      return this.handleError("LeadAlloyService.create", error)
    }
  }

  async update(
    input: UpdateLeadAlloySchema
  ): Promise<ActionResponse<LeadAlloy>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing || !existing.is_active) {
        throw AppError.notFound("Liga não encontrada.")
      }

      const leadAlloy = await this.repository.update(
        input.id,
        {
          code: input.code,
          description: input.description
        },
        input.updated_at
      )

      return actionSuccess(leadAlloy, "Liga atualizada com sucesso.")
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "LeadAlloyService.update",
          AppError.badRequest("Já existe uma liga com este código.")
        )
      }

      return this.handleError("LeadAlloyService.update", error)
    }
  }

  async remove(id: string): Promise<ActionResponse> {
    try {
      const existing = await this.repository.findById(id)

      if (!existing || !existing.is_active) {
        throw AppError.notFound("Liga não encontrada.")
      }

      await this.repository.remove(id)

      return actionSuccess(undefined, "Liga desativada com sucesso.")
    } catch (error) {
      return this.handleError("LeadAlloyService.remove", error)
    }
  }
}
