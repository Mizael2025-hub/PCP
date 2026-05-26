import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { SectorRepository } from "@/repositories/sector-repository"
import { BaseService } from "@/services/base-service"
import type { Employee, EmployeeWithSector } from "@/types/employee"
import type { Sector } from "@/types/sector"
import type {
  CreateEmployeeSchema,
  UpdateEmployeeSchema
} from "@/validations/employees/employee-schema"

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

export class EmployeeService extends BaseService {
  private readonly repository = new EmployeeRepository()
  private readonly sectorRepository = new SectorRepository()

  async list(): Promise<ActionResponse<EmployeeWithSector[]>> {
    try {
      const [employees, sectors] = await Promise.all([
        this.repository.findAll(true),
        this.sectorRepository.findAll(true)
      ])

      return actionSuccess(this.attachSectors(employees, sectors))
    } catch (error) {
      return this.handleError("EmployeeService.list", error)
    }
  }

  async create(
    input: CreateEmployeeSchema
  ): Promise<ActionResponse<EmployeeWithSector>> {
    try {
      await this.assertSectorIsActive(input.sector_id)

      const employee = await this.repository.create({
        name: input.name,
        registration_code: input.registration_code,
        sector_id: input.sector_id
      })

      return actionSuccess(
        { ...employee, sectors: null },
        "Funcionário criado com sucesso."
      )
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "EmployeeService.create",
          AppError.badRequest("Já existe um funcionário com esta matrícula.")
        )
      }

      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "EmployeeService.create",
          AppError.badRequest("Setor informado não é válido.")
        )
      }

      return this.handleError("EmployeeService.create", error)
    }
  }

  async update(
    input: UpdateEmployeeSchema
  ): Promise<ActionResponse<EmployeeWithSector>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing || !existing.is_active) {
        throw AppError.notFound("Funcionário não encontrado.")
      }

      await this.assertSectorIsActive(input.sector_id)

      const employee = await this.repository.update(input.id, {
        name: input.name,
        registration_code: input.registration_code,
        sector_id: input.sector_id
      })

      return actionSuccess(
        { ...employee, sectors: null },
        "Funcionário atualizado com sucesso."
      )
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.handleError(
          "EmployeeService.update",
          AppError.badRequest("Já existe um funcionário com esta matrícula.")
        )
      }

      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "EmployeeService.update",
          AppError.badRequest("Setor informado não é válido.")
        )
      }

      return this.handleError("EmployeeService.update", error)
    }
  }

  async remove(id: string): Promise<ActionResponse> {
    try {
      const existing = await this.repository.findById(id)

      if (!existing || !existing.is_active) {
        throw AppError.notFound("Funcionário não encontrado.")
      }

      await this.repository.softDelete(id)

      return actionSuccess(undefined, "Funcionário excluído com sucesso.")
    } catch (error) {
      return this.handleError("EmployeeService.remove", error)
    }
  }

  private async assertSectorIsActive(sectorId: string): Promise<void> {
    const sector = await this.sectorRepository.findById(sectorId)

    if (!sector || !sector.is_active) {
      throw AppError.badRequest("Setor informado não está ativo.")
    }
  }

  private attachSectors(
    employees: Employee[],
    sectors: Sector[]
  ): EmployeeWithSector[] {
    const sectorById = new Map(
      sectors.map((sector) => [sector.id, { id: sector.id, name: sector.name }])
    )

    return employees.map((employee) => ({
      ...employee,
      sectors: employee.sector_id
        ? (sectorById.get(employee.sector_id) ?? null)
        : null
    }))
  }
}
