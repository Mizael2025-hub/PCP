import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { OxideMillProductionRepository } from "@/repositories/oxide-mill-production-repository"
import { ShiftRepository } from "@/repositories/shift-repository"
import { BaseService } from "@/services/base-service"
import type { Employee } from "@/types/employee"
import type {
  OxideMillDailySummary,
  OxideMillListFilters,
  OxideMillProduction,
  OxideMillProductionWithRelations
} from "@/types/oxide-mill-production"
import type { Shift } from "@/types/shift"
import type {
  CreateOxideMillSchema,
  UpdateOxideMillSchema
} from "@/validations/oxide-mill-production/production-schema"

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class OxideMillProductionService extends BaseService {
  private readonly repository = new OxideMillProductionRepository()
  private readonly shiftRepository = new ShiftRepository()
  private readonly employeeRepository = new EmployeeRepository()

  async list(
    filters?: OxideMillListFilters
  ): Promise<ActionResponse<OxideMillProductionWithRelations[]>> {
    try {
      const [records, shifts, employees] = await Promise.all([
        this.repository.findAll(filters),
        this.shiftRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      return actionSuccess(this.attachRelations(records, shifts, employees))
    } catch (error) {
      return this.handleError("OxideMillProductionService.list", error)
    }
  }

  async create(
    input: CreateOxideMillSchema
  ): Promise<ActionResponse<OxideMillProductionWithRelations>> {
    try {
      await this.assertReferences(input)

      const record = await this.repository.create({
        date: input.date,
        shift_id: input.shift_id,
        operator_id: input.operator_id,
        oxide_weight: input.oxide_weight,
        oxidation_degree: input.oxidation_degree
      })

      const [shifts, employees] = await Promise.all([
        this.shiftRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      const [withRelations] = this.attachRelations([record], shifts, employees)

      return actionSuccess(
        withRelations,
        "Produção de óxido registrada com sucesso."
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "OxideMillProductionService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("OxideMillProductionService.create", error)
    }
  }

  async update(
    input: UpdateOxideMillSchema
  ): Promise<ActionResponse<OxideMillProductionWithRelations>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Apontamento não encontrado.")
      }

      await this.assertReferences(input)

      const record = await this.repository.update(
        input.id,
        {
          date: input.date,
          shift_id: input.shift_id,
          operator_id: input.operator_id,
          oxide_weight: input.oxide_weight,
          oxidation_degree: input.oxidation_degree
        },
        input.updated_at
      )

      const [shifts, employees] = await Promise.all([
        this.shiftRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      const [withRelations] = this.attachRelations([record], shifts, employees)

      return actionSuccess(withRelations, "Apontamento atualizado com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "OxideMillProductionService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("OxideMillProductionService.update", error)
    }
  }

  buildDailySummary(
    records: OxideMillProductionWithRelations[]
  ): OxideMillDailySummary[] {
    const byDate = new Map<
      string,
      { totalWeight: number; totalDegree: number; count: number }
    >()

    for (const record of records) {
      const current = byDate.get(record.date) ?? {
        totalWeight: 0,
        totalDegree: 0,
        count: 0
      }

      current.totalWeight += record.oxide_weight
      current.totalDegree += record.oxidation_degree
      current.count += 1

      byDate.set(record.date, current)
    }

    return Array.from(byDate.entries())
      .map(([date, stats]) => ({
        date,
        totalOxideWeight: stats.totalWeight,
        averageOxidationDegree: stats.totalDegree / stats.count,
        recordCount: stats.count
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14)
      .reverse()
  }

  private async assertReferences(input: CreateOxideMillSchema): Promise<void> {
    const [shift, operator] = await Promise.all([
      this.shiftRepository.findById(input.shift_id),
      this.employeeRepository.findById(input.operator_id)
    ])

    if (!shift) {
      throw AppError.badRequest("Turno informado não é válido.")
    }

    if (!operator || !operator.is_active) {
      throw AppError.badRequest("Operador informado não está ativo.")
    }
  }

  private attachRelations(
    records: OxideMillProduction[],
    shifts: Shift[],
    employees: Employee[]
  ): OxideMillProductionWithRelations[] {
    const shiftById = new Map(
      shifts.map((shift) => [shift.id, { id: shift.id, name: shift.name }])
    )
    const employeeById = new Map(
      employees.map((employee) => [
        employee.id,
        { id: employee.id, name: employee.name }
      ])
    )

    return records.map((record) => ({
      ...record,
      shifts: shiftById.get(record.shift_id) ?? null,
      employees: employeeById.get(record.operator_id) ?? null
    }))
  }
}
