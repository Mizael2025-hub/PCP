import { AppError } from "@/lib/errors/app-error"
import { formatEpCode } from "@/lib/utils/ep-code"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { BatteryModelRepository } from "@/repositories/battery-model-repository"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { MachineRepository } from "@/repositories/machine-repository"
import { PastingProductionRepository } from "@/repositories/pasting-production-repository"
import { ShiftRepository } from "@/repositories/shift-repository"
import { BaseService } from "@/services/base-service"
import type { BatteryModel } from "@/types/battery-model"
import type { Employee } from "@/types/employee"
import type { Machine } from "@/types/machine"
import type {
  PastingListFilters,
  PastingProduction,
  PastingProductionWithRelations
} from "@/types/pasting-production"
import type { Shift } from "@/types/shift"
import type {
  CreatePastingSchema,
  UpdatePastingSchema
} from "@/validations/pasting-production/production-schema"

const MAX_EP_CODE_RETRIES = 3

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  )
}

export class PastingProductionService extends BaseService {
  private readonly repository = new PastingProductionRepository()
  private readonly shiftRepository = new ShiftRepository()
  private readonly machineRepository = new MachineRepository()
  private readonly employeeRepository = new EmployeeRepository()
  private readonly batteryModelRepository = new BatteryModelRepository()

  async list(
    filters?: PastingListFilters
  ): Promise<ActionResponse<PastingProductionWithRelations[]>> {
    try {
      const [records, shifts, machines, employees, batteryModels] =
        await Promise.all([
          this.repository.findAll(filters),
          this.shiftRepository.findAll(),
          this.machineRepository.findAll(true),
          this.employeeRepository.findAll(true),
          this.batteryModelRepository.findAll()
        ])

      return actionSuccess(
        this.attachRelations(
          records,
          shifts,
          machines,
          employees,
          batteryModels
        )
      )
    } catch (error) {
      return this.handleError("PastingProductionService.list", error)
    }
  }

  async create(
    input: CreatePastingSchema
  ): Promise<ActionResponse<PastingProductionWithRelations>> {
    try {
      const batteryModel = await this.assertReferences(input)

      let record: PastingProduction | null = null
      let lastError: unknown

      for (let attempt = 0; attempt < MAX_EP_CODE_RETRIES; attempt++) {
        const epCode = await this.generateEpCode(
          input.date,
          input.battery_model_id,
          batteryModel.code,
          attempt
        )

        try {
          record = await this.repository.create({
            ep_code: epCode,
            date: input.date,
            shift_id: input.shift_id,
            machine_id: input.machine_id,
            operator_id: input.operator_id,
            battery_model_id: input.battery_model_id,
            plates_qty: input.plates_qty
          })
          break
        } catch (error) {
          lastError = error

          if (!isUniqueViolation(error)) {
            throw error
          }
        }
      }

      if (!record) {
        return this.handleError(
          "PastingProductionService.create",
          lastError ?? AppError.badRequest("Não foi possível gerar o EP Code.")
        )
      }

      const [shifts, machines, employees, batteryModels] = await Promise.all([
        this.shiftRepository.findAll(),
        this.machineRepository.findAll(true),
        this.employeeRepository.findAll(true),
        this.batteryModelRepository.findAll()
      ])

      const [withRelations] = this.attachRelations(
        [record],
        shifts,
        machines,
        employees,
        batteryModels
      )

      return actionSuccess(
        withRelations,
        `Produção registrada com sucesso. EP Code: ${record.ep_code}`
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "PastingProductionService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("PastingProductionService.create", error)
    }
  }

  async update(
    input: UpdatePastingSchema
  ): Promise<ActionResponse<PastingProductionWithRelations>> {
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
          machine_id: input.machine_id,
          operator_id: input.operator_id,
          battery_model_id: input.battery_model_id,
          plates_qty: input.plates_qty
        },
        input.updated_at
      )

      const [shifts, machines, employees, batteryModels] = await Promise.all([
        this.shiftRepository.findAll(),
        this.machineRepository.findAll(true),
        this.employeeRepository.findAll(true),
        this.batteryModelRepository.findAll()
      ])

      const [withRelations] = this.attachRelations(
        [record],
        shifts,
        machines,
        employees,
        batteryModels
      )

      return actionSuccess(withRelations, "Apontamento atualizado com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "PastingProductionService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("PastingProductionService.update", error)
    }
  }

  private async generateEpCode(
    date: string,
    batteryModelId: string,
    modelCode: string,
    retryOffset: number
  ): Promise<string> {
    const count = await this.repository.countByDateAndModel(
      date,
      batteryModelId
    )

    return formatEpCode(modelCode, date, count + 1 + retryOffset)
  }

  private async assertReferences(
    input: CreatePastingSchema
  ): Promise<BatteryModel> {
    const [shift, machine, operator, batteryModel] = await Promise.all([
      this.shiftRepository.findById(input.shift_id),
      this.machineRepository.findById(input.machine_id),
      this.employeeRepository.findById(input.operator_id),
      this.batteryModelRepository.findById(input.battery_model_id)
    ])

    if (!shift) {
      throw AppError.badRequest("Turno informado não é válido.")
    }

    if (!machine || !machine.is_active) {
      throw AppError.badRequest("Máquina informada não está ativa.")
    }

    if (!operator || !operator.is_active) {
      throw AppError.badRequest("Operador informado não está ativo.")
    }

    if (!batteryModel) {
      throw AppError.badRequest("Modelo de bateria informado não é válido.")
    }

    if (
      machine.sector_id &&
      operator.sector_id &&
      machine.sector_id !== operator.sector_id
    ) {
      throw AppError.badRequest(
        "Máquina e operador devem pertencer ao mesmo setor."
      )
    }

    return batteryModel
  }

  private attachRelations(
    records: PastingProduction[],
    shifts: Shift[],
    machines: Machine[],
    employees: Employee[],
    batteryModels: BatteryModel[]
  ): PastingProductionWithRelations[] {
    const shiftById = new Map(
      shifts.map((shift) => [shift.id, { id: shift.id, name: shift.name }])
    )
    const machineById = new Map(
      machines.map((machine) => [
        machine.id,
        {
          id: machine.id,
          name: machine.name,
          sector_id: machine.sector_id
        }
      ])
    )
    const employeeById = new Map(
      employees.map((employee) => [
        employee.id,
        {
          id: employee.id,
          name: employee.name,
          sector_id: employee.sector_id
        }
      ])
    )
    const batteryModelById = new Map(
      batteryModels.map((model) => [
        model.id,
        {
          id: model.id,
          code: model.code,
          name: model.name,
          weight_specification: model.weight_specification
        }
      ])
    )

    return records.map((record) => ({
      ...record,
      shifts: shiftById.get(record.shift_id) ?? null,
      machines: machineById.get(record.machine_id) ?? null,
      employees: employeeById.get(record.operator_id) ?? null,
      battery_models: batteryModelById.get(record.battery_model_id) ?? null
    }))
  }
}
