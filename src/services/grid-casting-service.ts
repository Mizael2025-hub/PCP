import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { AuthRepository } from "@/repositories/auth-repository"
import { BatteryModelRepository } from "@/repositories/battery-model-repository"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { GridCastingProductionRepository } from "@/repositories/grid-casting-production-repository"
import { LeadAlloyRepository } from "@/repositories/lead-alloy-repository"
import { MachineRepository } from "@/repositories/machine-repository"
import { ShiftRepository } from "@/repositories/shift-repository"
import { BaseService } from "@/services/base-service"
import type { BatteryModel } from "@/types/battery-model"
import type { Employee } from "@/types/employee"
import type {
  GridCastingListFilters,
  GridCastingProduction,
  GridCastingProductionWithRelations
} from "@/types/grid-casting"
import type { LeadAlloy } from "@/types/lead-alloy"
import type { Machine } from "@/types/machine"
import type { Shift } from "@/types/shift"
import type {
  CreateGridCastingSchema,
  UpdateGridCastingSchema
} from "@/validations/grid-casting/production-schema"

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class GridCastingService extends BaseService {
  private readonly repository = new GridCastingProductionRepository()
  private readonly shiftRepository = new ShiftRepository()
  private readonly machineRepository = new MachineRepository()
  private readonly employeeRepository = new EmployeeRepository()
  private readonly leadAlloyRepository = new LeadAlloyRepository()
  private readonly batteryModelRepository = new BatteryModelRepository()
  private readonly authRepository = new AuthRepository()

  async list(
    filters?: GridCastingListFilters
  ): Promise<ActionResponse<GridCastingProductionWithRelations[]>> {
    try {
      const [records, shifts, machines, employees, alloys, batteryModels] =
        await Promise.all([
          this.repository.findAll(filters),
          this.shiftRepository.findAll(),
          this.machineRepository.findAll(true),
          this.employeeRepository.findAll(true),
          this.leadAlloyRepository.findAll(),
          this.batteryModelRepository.findAll()
        ])

      return actionSuccess(
        this.attachRelations(
          records,
          shifts,
          machines,
          employees,
          alloys,
          batteryModels
        )
      )
    } catch (error) {
      return this.handleError("GridCastingService.list", error)
    }
  }

  async create(
    input: CreateGridCastingSchema
  ): Promise<ActionResponse<GridCastingProductionWithRelations>> {
    try {
      await this.assertReferences(input)
      const createdBy = await this.resolveCreatedBy()

      const record = await this.repository.create({
        date: input.date,
        shift_id: input.shift_id,
        machine_id: input.machine_id,
        operator_id: input.operator_id,
        alloy_id: input.alloy_id,
        battery_model_id: input.battery_model_id,
        gross_weight: input.gross_weight,
        net_weight: input.net_weight,
        produced_qty: input.produced_qty,
        created_by: createdBy
      })

      const [shifts, machines, employees, alloys, batteryModels] =
        await Promise.all([
          this.shiftRepository.findAll(),
          this.machineRepository.findAll(true),
          this.employeeRepository.findAll(true),
          this.leadAlloyRepository.findAll(),
          this.batteryModelRepository.findAll()
        ])

      const [withRelations] = this.attachRelations(
        [record],
        shifts,
        machines,
        employees,
        alloys,
        batteryModels
      )

      return actionSuccess(withRelations, "Apontamento registrado com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "GridCastingService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("GridCastingService.create", error)
    }
  }

  async update(
    input: UpdateGridCastingSchema
  ): Promise<ActionResponse<GridCastingProductionWithRelations>> {
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
          alloy_id: input.alloy_id,
          battery_model_id: input.battery_model_id,
          gross_weight: input.gross_weight,
          net_weight: input.net_weight,
          produced_qty: input.produced_qty
        },
        input.updated_at
      )

      const [shifts, machines, employees, alloys, batteryModels] =
        await Promise.all([
          this.shiftRepository.findAll(),
          this.machineRepository.findAll(true),
          this.employeeRepository.findAll(true),
          this.leadAlloyRepository.findAll(),
          this.batteryModelRepository.findAll()
        ])

      const [withRelations] = this.attachRelations(
        [record],
        shifts,
        machines,
        employees,
        alloys,
        batteryModels
      )

      return actionSuccess(withRelations, "Apontamento atualizado com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "GridCastingService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("GridCastingService.update", error)
    }
  }

  private async assertReferences(
    input: CreateGridCastingSchema
  ): Promise<void> {
    const [shift, machine, operator, alloy, batteryModel] = await Promise.all([
      this.shiftRepository.findById(input.shift_id),
      this.machineRepository.findById(input.machine_id),
      this.employeeRepository.findById(input.operator_id),
      this.leadAlloyRepository.findById(input.alloy_id),
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

    if (!alloy) {
      throw AppError.badRequest("Liga informada não é válida.")
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

    if (input.net_weight > input.gross_weight) {
      throw AppError.badRequest(
        "Peso líquido não pode ser maior que o peso bruto."
      )
    }
  }

  private async resolveCreatedBy(): Promise<string | null> {
    const { data, error } = await this.authRepository.getUser()

    if (error) {
      console.error("[GridCastingService.resolveCreatedBy]", error)
      return null
    }

    return data.user?.id ?? null
  }

  private attachRelations(
    records: GridCastingProduction[],
    shifts: Shift[],
    machines: Machine[],
    employees: Employee[],
    alloys: LeadAlloy[],
    batteryModels: BatteryModel[]
  ): GridCastingProductionWithRelations[] {
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
    const alloyById = new Map(
      alloys.map((alloy) => [
        alloy.id,
        {
          id: alloy.id,
          code: alloy.code,
          description: alloy.description
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
      lead_alloys: alloyById.get(record.alloy_id) ?? null,
      battery_models: batteryModelById.get(record.battery_model_id) ?? null
    }))
  }
}
