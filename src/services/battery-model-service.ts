import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { BatteryModelRepository } from "@/repositories/battery-model-repository"
import { BaseService } from "@/services/base-service"
import type { BatteryModel } from "@/types/battery-model"
import type {
  CreateBatteryModelSchema,
  UpdateBatteryModelSchema
} from "@/validations/battery-models/battery-model-schema"

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

export class BatteryModelService extends BaseService {
  private readonly repository = new BatteryModelRepository()

  async list(): Promise<ActionResponse<BatteryModel[]>> {
    try {
      const batteryModels = await this.repository.findAll()
      return actionSuccess(batteryModels)
    } catch (error) {
      return this.handleError("BatteryModelService.list", error)
    }
  }

  async create(
    input: CreateBatteryModelSchema
  ): Promise<ActionResponse<BatteryModel>> {
    try {
      const batteryModel = await this.repository.create({
        code: input.code,
        name: input.name,
        weight_specification: input.weight_specification
      })

      return actionSuccess(
        batteryModel,
        "Modelo de bateria criado com sucesso."
      )
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "BatteryModelService.create",
          AppError.badRequest("Já existe um modelo com este código.")
        )
      }

      return this.handleError("BatteryModelService.create", error)
    }
  }

  async update(
    input: UpdateBatteryModelSchema
  ): Promise<ActionResponse<BatteryModel>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Modelo de bateria não encontrado.")
      }

      const batteryModel = await this.repository.update(input.id, {
        code: input.code,
        name: input.name,
        weight_specification: input.weight_specification
      })

      return actionSuccess(
        batteryModel,
        "Modelo de bateria atualizado com sucesso."
      )
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "BatteryModelService.update",
          AppError.badRequest("Já existe um modelo com este código.")
        )
      }

      return this.handleError("BatteryModelService.update", error)
    }
  }

  async remove(id: string): Promise<ActionResponse> {
    try {
      const existing = await this.repository.findById(id)

      if (!existing) {
        throw AppError.notFound("Modelo de bateria não encontrado.")
      }

      await this.repository.remove(id)

      return actionSuccess(undefined, "Modelo de bateria excluído com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "BatteryModelService.remove",
          AppError.badRequest(
            "Não é possível excluir: o modelo está em uso na produção."
          )
        )
      }

      return this.handleError("BatteryModelService.remove", error)
    }
  }
}
