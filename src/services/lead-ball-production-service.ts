import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { LeadBallProductionRepository } from "@/repositories/lead-ball-production-repository"
import { ShiftRepository } from "@/repositories/shift-repository"
import { BaseService } from "@/services/base-service"
import type { Employee } from "@/types/employee"
import type {
  LeadBallListFilters,
  LeadBallProduction,
  LeadBallProductionWithRelations
} from "@/types/lead-ball-production"
import type { Shift } from "@/types/shift"
import type {
  CreateLeadBallSchema,
  UpdateLeadBallSchema
} from "@/validations/lead-ball-production/production-schema"

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class LeadBallProductionService extends BaseService {
  private readonly repository = new LeadBallProductionRepository()
  private readonly shiftRepository = new ShiftRepository()
  private readonly employeeRepository = new EmployeeRepository()

  async list(
    filters?: LeadBallListFilters
  ): Promise<ActionResponse<LeadBallProductionWithRelations[]>> {
    try {
      const [records, shifts, employees] = await Promise.all([
        this.repository.findAll(filters),
        this.shiftRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      return actionSuccess(this.attachRelations(records, shifts, employees))
    } catch (error) {
      return this.handleError("LeadBallProductionService.list", error)
    }
  }

  async create(
    input: CreateLeadBallSchema
  ): Promise<ActionResponse<LeadBallProductionWithRelations>> {
    try {
      await this.assertReferences(input)

      const record = await this.repository.create({
        date: input.date,
        shift_id: input.shift_id,
        operator_id: input.operator_id,
        weight_produced: input.weight_produced,
        silo_number: input.silo_number
      })

      const [shifts, employees] = await Promise.all([
        this.shiftRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      const [withRelations] = this.attachRelations([record], shifts, employees)

      return actionSuccess(
        withRelations,
        "Produção de bola registrada com sucesso."
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "LeadBallProductionService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("LeadBallProductionService.create", error)
    }
  }

  async update(
    input: UpdateLeadBallSchema
  ): Promise<ActionResponse<LeadBallProductionWithRelations>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Apontamento não encontrado.")
      }

      await this.assertReferences(input)

      const record = await this.repository.update(input.id, {
        date: input.date,
        shift_id: input.shift_id,
        operator_id: input.operator_id,
        weight_produced: input.weight_produced,
        silo_number: input.silo_number
      })

      const [shifts, employees] = await Promise.all([
        this.shiftRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      const [withRelations] = this.attachRelations([record], shifts, employees)

      return actionSuccess(withRelations, "Apontamento atualizado com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "LeadBallProductionService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("LeadBallProductionService.update", error)
    }
  }

  private async assertReferences(input: CreateLeadBallSchema): Promise<void> {
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
    records: LeadBallProduction[],
    shifts: Shift[],
    employees: Employee[]
  ): LeadBallProductionWithRelations[] {
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
