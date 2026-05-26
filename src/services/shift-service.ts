import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { ShiftRepository } from "@/repositories/shift-repository"
import { BaseService } from "@/services/base-service"
import type { Shift } from "@/types/shift"
import type {
  CreateShiftSchema,
  UpdateShiftSchema
} from "@/validations/shifts/shift-schema"

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  )
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class ShiftService extends BaseService {
  private readonly repository = new ShiftRepository()

  async list(): Promise<ActionResponse<Shift[]>> {
    try {
      const shifts = await this.repository.findAll()
      return actionSuccess(shifts)
    } catch (error) {
      return this.handleError("ShiftService.list", error)
    }
  }

  async create(input: CreateShiftSchema): Promise<ActionResponse<Shift>> {
    try {
      const shift = await this.repository.create({
        name: input.name,
        start_time: input.start_time,
        end_time: input.end_time
      })

      return actionSuccess(shift, "Turno criado com sucesso.")
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "ShiftService.create",
          AppError.badRequest("Já existe um turno com este nome.")
        )
      }

      return this.handleError("ShiftService.create", error)
    }
  }

  async update(input: UpdateShiftSchema): Promise<ActionResponse<Shift>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Turno não encontrado.")
      }

      const shift = await this.repository.update(input.id, {
        name: input.name,
        start_time: input.start_time,
        end_time: input.end_time
      })

      return actionSuccess(shift, "Turno atualizado com sucesso.")
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "ShiftService.update",
          AppError.badRequest("Já existe um turno com este nome.")
        )
      }

      return this.handleError("ShiftService.update", error)
    }
  }

  async remove(id: string): Promise<ActionResponse> {
    try {
      const existing = await this.repository.findById(id)

      if (!existing) {
        throw AppError.notFound("Turno não encontrado.")
      }

      await this.repository.remove(id)

      return actionSuccess(undefined, "Turno excluído com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "ShiftService.remove",
          AppError.badRequest(
            "Não é possível excluir: o turno está em uso na produção."
          )
        )
      }

      return this.handleError("ShiftService.remove", error)
    }
  }
}
