import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { MixerProductionRepository } from "@/repositories/mixer-production-repository"
import { ShiftRepository } from "@/repositories/shift-repository"
import { BaseService } from "@/services/base-service"
import type { Employee } from "@/types/employee"
import type {
  MixerListFilters,
  MixerProduction,
  MixerProductionWithRelations
} from "@/types/mixer-production"
import type { Shift } from "@/types/shift"
import type {
  CreateMixerSchema,
  UpdateMixerSchema
} from "@/validations/mixer-production/production-schema"

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class MixerProductionService extends BaseService {
  private readonly repository = new MixerProductionRepository()
  private readonly shiftRepository = new ShiftRepository()
  private readonly employeeRepository = new EmployeeRepository()

  async list(
    filters?: MixerListFilters
  ): Promise<ActionResponse<MixerProductionWithRelations[]>> {
    try {
      const [records, shifts, employees] = await Promise.all([
        this.repository.findAll(filters),
        this.shiftRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      return actionSuccess(this.attachRelations(records, shifts, employees))
    } catch (error) {
      return this.handleError("MixerProductionService.list", error)
    }
  }

  async create(
    input: CreateMixerSchema
  ): Promise<ActionResponse<MixerProductionWithRelations>> {
    try {
      await this.assertReferences(input)

      const record = await this.repository.create({
        date: input.date,
        shift_id: input.shift_id,
        operator_id: input.operator_id,
        batch_number: input.batch_number,
        lead_ball_weight: input.lead_ball_weight,
        oxide_weight: input.oxide_weight,
        water_volume: input.water_volume,
        acid_volume: input.acid_volume,
        density: input.density
      })

      const [shifts, employees] = await Promise.all([
        this.shiftRepository.findAll(),
        this.employeeRepository.findAll(true)
      ])

      const [withRelations] = this.attachRelations([record], shifts, employees)

      return actionSuccess(
        withRelations,
        "Produção do misturador registrada com sucesso."
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "MixerProductionService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("MixerProductionService.create", error)
    }
  }

  async update(
    input: UpdateMixerSchema
  ): Promise<ActionResponse<MixerProductionWithRelations>> {
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
          batch_number: input.batch_number,
          lead_ball_weight: input.lead_ball_weight,
          oxide_weight: input.oxide_weight,
          water_volume: input.water_volume,
          acid_volume: input.acid_volume,
          density: input.density
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
          "MixerProductionService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("MixerProductionService.update", error)
    }
  }

  private async assertReferences(input: CreateMixerSchema): Promise<void> {
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
    records: MixerProduction[],
    shifts: Shift[],
    employees: Employee[]
  ): MixerProductionWithRelations[] {
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
