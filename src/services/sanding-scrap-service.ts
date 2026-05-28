import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { SandingScrapRepository } from "@/repositories/sanding-scrap-repository"
import { BaseService } from "@/services/base-service"
import type { Employee } from "@/types/employee"
import type {
  SandingScrap,
  SandingScrapDailySummary,
  SandingScrapListFilters,
  SandingScrapOperatorSummary,
  SandingScrapWithRelations
} from "@/types/sanding-scrap"
import type {
  CreateSandingScrapSchema,
  UpdateSandingScrapSchema
} from "@/validations/sanding-scrap/scrap-schema"

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class SandingScrapService extends BaseService {
  private readonly repository = new SandingScrapRepository()
  private readonly employeeRepository = new EmployeeRepository()

  async list(
    filters?: SandingScrapListFilters
  ): Promise<ActionResponse<SandingScrapWithRelations[]>> {
    try {
      const [records, employees] = await Promise.all([
        this.repository.findAll(filters),
        this.employeeRepository.findAll(true)
      ])

      return actionSuccess(this.attachRelations(records, employees))
    } catch (error) {
      return this.handleError("SandingScrapService.list", error)
    }
  }

  async create(
    input: CreateSandingScrapSchema
  ): Promise<ActionResponse<SandingScrapWithRelations>> {
    try {
      await this.assertReferences(input)

      const record = await this.repository.create({
        date: input.date,
        operator_id: input.operator_id,
        scrap_weight: input.scrap_weight,
        plates_qty_lost: input.plates_qty_lost
      })

      const employees = await this.employeeRepository.findAll(true)
      const [withRelations] = this.attachRelations([record], employees)

      return actionSuccess(
        withRelations,
        "Refugo de lixação registrado com sucesso."
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "SandingScrapService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("SandingScrapService.create", error)
    }
  }

  async update(
    input: UpdateSandingScrapSchema
  ): Promise<ActionResponse<SandingScrapWithRelations>> {
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
          operator_id: input.operator_id,
          scrap_weight: input.scrap_weight,
          plates_qty_lost: input.plates_qty_lost
        },
        input.updated_at
      )

      const employees = await this.employeeRepository.findAll(true)
      const [withRelations] = this.attachRelations([record], employees)

      return actionSuccess(withRelations, "Apontamento atualizado com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "SandingScrapService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("SandingScrapService.update", error)
    }
  }

  buildDailySummary(
    records: SandingScrapWithRelations[]
  ): SandingScrapDailySummary[] {
    const byDate = new Map<
      string,
      { totalScrapWeight: number; totalPlatesLost: number; count: number }
    >()

    for (const record of records) {
      const current = byDate.get(record.date) ?? {
        totalScrapWeight: 0,
        totalPlatesLost: 0,
        count: 0
      }
      current.totalScrapWeight += record.scrap_weight
      current.totalPlatesLost += record.plates_qty_lost
      current.count += 1
      byDate.set(record.date, current)
    }

    return Array.from(byDate.entries())
      .map(([date, stats]) => ({
        date,
        totalScrapWeight: stats.totalScrapWeight,
        totalPlatesLost: stats.totalPlatesLost,
        recordCount: stats.count
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14)
      .reverse()
  }

  buildOperatorSummary(
    records: SandingScrapWithRelations[]
  ): SandingScrapOperatorSummary[] {
    const byOperator = new Map<
      string,
      {
        label: string
        totalScrapWeight: number
        totalPlatesLost: number
        count: number
      }
    >()

    for (const record of records) {
      const id = record.operator_id
      const label = record.employees?.name ?? "Sem operador"
      const current = byOperator.get(id) ?? {
        label,
        totalScrapWeight: 0,
        totalPlatesLost: 0,
        count: 0
      }
      current.totalScrapWeight += record.scrap_weight
      current.totalPlatesLost += record.plates_qty_lost
      current.count += 1
      byOperator.set(id, current)
    }

    return Array.from(byOperator.entries())
      .map(([id, stats]) => ({
        id,
        label: stats.label,
        totalScrapWeight: stats.totalScrapWeight,
        totalPlatesLost: stats.totalPlatesLost,
        recordCount: stats.count
      }))
      .sort((a, b) => b.totalScrapWeight - a.totalScrapWeight)
      .slice(0, 8)
  }

  private async assertReferences(
    input: CreateSandingScrapSchema
  ): Promise<void> {
    const operator = await this.employeeRepository.findById(input.operator_id)

    if (!operator || !operator.is_active) {
      throw AppError.badRequest("Operador informado não está ativo.")
    }
  }

  private attachRelations(
    records: SandingScrap[],
    employees: Employee[]
  ): SandingScrapWithRelations[] {
    const employeeById = new Map(
      employees.map((employee) => [
        employee.id,
        { id: employee.id, name: employee.name }
      ])
    )

    return records.map((record) => ({
      ...record,
      employees: employeeById.get(record.operator_id) ?? null
    }))
  }
}
