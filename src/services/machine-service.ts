import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { MachineRepository } from "@/repositories/machine-repository"
import { SectorRepository } from "@/repositories/sector-repository"
import { BaseService } from "@/services/base-service"
import type { Machine, MachineWithSector } from "@/types/machine"
import type { Sector } from "@/types/sector"
import type {
  CreateMachineSchema,
  UpdateMachineSchema
} from "@/validations/machines/machine-schema"

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

export class MachineService extends BaseService {
  private readonly repository = new MachineRepository()
  private readonly sectorRepository = new SectorRepository()

  async list(): Promise<ActionResponse<MachineWithSector[]>> {
    try {
      const [machines, sectors] = await Promise.all([
        this.repository.findAll(true),
        this.sectorRepository.findAll(true)
      ])

      return actionSuccess(this.attachSectors(machines, sectors))
    } catch (error) {
      return this.handleError("MachineService.list", error)
    }
  }

  async create(
    input: CreateMachineSchema
  ): Promise<ActionResponse<MachineWithSector>> {
    try {
      await this.assertSectorIsActive(input.sector_id)

      const machine = await this.repository.create({
        name: input.name,
        sector_id: input.sector_id
      })

      return actionSuccess(
        { ...machine, sectors: null },
        "Máquina criada com sucesso."
      )
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "MachineService.create",
          AppError.badRequest("Já existe uma máquina com este nome.")
        )
      }

      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "MachineService.create",
          AppError.badRequest("Setor informado não é válido.")
        )
      }

      return this.handleError("MachineService.create", error)
    }
  }

  async update(
    input: UpdateMachineSchema
  ): Promise<ActionResponse<MachineWithSector>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing || !existing.is_active) {
        throw AppError.notFound("Máquina não encontrada.")
      }

      await this.assertSectorIsActive(input.sector_id)

      const machine = await this.repository.update(input.id, {
        name: input.name,
        sector_id: input.sector_id
      })

      return actionSuccess(
        { ...machine, sectors: null },
        "Máquina atualizada com sucesso."
      )
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "MachineService.update",
          AppError.badRequest("Já existe uma máquina com este nome.")
        )
      }

      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "MachineService.update",
          AppError.badRequest("Setor informado não é válido.")
        )
      }

      return this.handleError("MachineService.update", error)
    }
  }

  async remove(id: string): Promise<ActionResponse> {
    try {
      const existing = await this.repository.findById(id)

      if (!existing || !existing.is_active) {
        throw AppError.notFound("Máquina não encontrada.")
      }

      await this.repository.softDelete(id)

      return actionSuccess(undefined, "Máquina excluída com sucesso.")
    } catch (error) {
      return this.handleError("MachineService.remove", error)
    }
  }

  private async assertSectorIsActive(sectorId: string): Promise<void> {
    const sector = await this.sectorRepository.findById(sectorId)

    if (!sector || !sector.is_active) {
      throw AppError.badRequest("Setor informado não está ativo.")
    }
  }

  private attachSectors(
    machines: Machine[],
    sectors: Sector[]
  ): MachineWithSector[] {
    const sectorById = new Map(
      sectors.map((sector) => [sector.id, { id: sector.id, name: sector.name }])
    )

    return machines.map((machine) => ({
      ...machine,
      sectors: machine.sector_id
        ? (sectorById.get(machine.sector_id) ?? null)
        : null
    }))
  }
}
