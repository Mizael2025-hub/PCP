import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { SectorRepository } from "@/repositories/sector-repository"
import { BaseService } from "@/services/base-service"
import type { Sector } from "@/types/sector"
import type {
  CreateSectorSchema,
  UpdateSectorSchema
} from "@/validations/sectors/sector-schema"

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  )
}

export class SectorService extends BaseService {
  private readonly repository = new SectorRepository()

  async list(): Promise<ActionResponse<Sector[]>> {
    try {
      const sectors = await this.repository.findAll(true)
      return actionSuccess(sectors)
    } catch (error) {
      return this.handleError("SectorService.list", error)
    }
  }

  async create(input: CreateSectorSchema): Promise<ActionResponse<Sector>> {
    try {
      const sector = await this.repository.create({ name: input.name })
      return actionSuccess(sector, "Setor criado com sucesso.")
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "SectorService.create",
          AppError.badRequest("Já existe um setor com este nome.")
        )
      }

      return this.handleError("SectorService.create", error)
    }
  }

  async update(input: UpdateSectorSchema): Promise<ActionResponse<Sector>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing || !existing.is_active) {
        throw AppError.notFound("Setor não encontrado.")
      }

      const sector = await this.repository.update(input.id, {
        name: input.name
      })

      return actionSuccess(sector, "Setor atualizado com sucesso.")
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "SectorService.update",
          AppError.badRequest("Já existe um setor com este nome.")
        )
      }

      return this.handleError("SectorService.update", error)
    }
  }

  async remove(id: string): Promise<ActionResponse> {
    try {
      const existing = await this.repository.findById(id)

      if (!existing || !existing.is_active) {
        throw AppError.notFound("Setor não encontrado.")
      }

      await this.repository.softDelete(id)

      return actionSuccess(undefined, "Setor excluído com sucesso.")
    } catch (error) {
      return this.handleError("SectorService.remove", error)
    }
  }
}
