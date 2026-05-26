import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { GridCastingDowntimeRepository } from "@/repositories/grid-casting-downtime-repository"
import { GridCastingProductionRepository } from "@/repositories/grid-casting-production-repository"
import { BatteryModelRepository } from "@/repositories/battery-model-repository"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { LeadAlloyRepository } from "@/repositories/lead-alloy-repository"
import { MachineRepository } from "@/repositories/machine-repository"
import { ShiftRepository } from "@/repositories/shift-repository"
import { BaseService } from "@/services/base-service"
import type { BatteryModel } from "@/types/battery-model"
import type { Employee } from "@/types/employee"
import type {
  GridCastingDowntime,
  GridCastingDowntimeListFilters,
  GridCastingDowntimeWithProduction
} from "@/types/grid-casting-downtime"
import type {
  GridCastingListFilters,
  GridCastingProduction,
  GridCastingProductionWithRelations
} from "@/types/grid-casting"
import type { LeadAlloy } from "@/types/lead-alloy"
import type { Machine } from "@/types/machine"
import type { Shift } from "@/types/shift"
import type {
  CreateGridCastingDowntimeSchema,
  UpdateGridCastingDowntimeSchema
} from "@/validations/grid-casting/downtime-schema"

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class GridCastingDowntimeService extends BaseService {
  private readonly repository = new GridCastingDowntimeRepository()
  private readonly productionRepository = new GridCastingProductionRepository()
  private readonly shiftRepository = new ShiftRepository()
  private readonly machineRepository = new MachineRepository()
  private readonly employeeRepository = new EmployeeRepository()
  private readonly leadAlloyRepository = new LeadAlloyRepository()
  private readonly batteryModelRepository = new BatteryModelRepository()

  async list(
    filters?: GridCastingDowntimeListFilters
  ): Promise<ActionResponse<GridCastingDowntimeWithProduction[]>> {
    try {
      const productionFilters: GridCastingListFilters = {
        dateFrom: filters?.dateFrom,
        dateTo: filters?.dateTo,
        shiftId: filters?.shiftId
      }

      const [productions, shifts, machines, employees, alloys, batteryModels] =
        await Promise.all([
          this.productionRepository.findAll(productionFilters),
          this.shiftRepository.findAll(),
          this.machineRepository.findAll(true),
          this.employeeRepository.findAll(true),
          this.leadAlloyRepository.findAll(),
          this.batteryModelRepository.findAll()
        ])

      const productionsWithRelations = this.attachProductionRelations(
        productions,
        shifts,
        machines,
        employees,
        alloys,
        batteryModels
      )

      const productionIds = productionsWithRelations.map(
        (production) => production.id
      )

      const records = await this.repository.findByProductionIds(
        filters ?? {},
        productionIds
      )

      const productionById = new Map(
        productionsWithRelations.map((production) => [
          production.id,
          production
        ])
      )

      const withProduction = records.map((record) => ({
        ...record,
        production: productionById.get(record.production_id) ?? null
      }))

      return actionSuccess(withProduction)
    } catch (error) {
      return this.handleError("GridCastingDowntimeService.list", error)
    }
  }

  async listProductionOptions(
    filters?: GridCastingListFilters
  ): Promise<ActionResponse<GridCastingProductionWithRelations[]>> {
    try {
      const [productions, shifts, machines, employees, alloys, batteryModels] =
        await Promise.all([
          this.productionRepository.findAll(filters),
          this.shiftRepository.findAll(),
          this.machineRepository.findAll(true),
          this.employeeRepository.findAll(true),
          this.leadAlloyRepository.findAll(),
          this.batteryModelRepository.findAll()
        ])

      return actionSuccess(
        this.attachProductionRelations(
          productions,
          shifts,
          machines,
          employees,
          alloys,
          batteryModels
        )
      )
    } catch (error) {
      return this.handleError(
        "GridCastingDowntimeService.listProductionOptions",
        error
      )
    }
  }

  async create(
    input: CreateGridCastingDowntimeSchema
  ): Promise<ActionResponse<GridCastingDowntimeWithProduction>> {
    try {
      await this.assertProductionExists(input.production_id)

      const record = await this.repository.create({
        production_id: input.production_id,
        reason: input.reason,
        duration_minutes: input.duration_minutes,
        start_time: input.start_time,
        end_time: input.end_time
      })

      const withProduction = await this.attachSingleProduction(record)

      return actionSuccess(withProduction, "Parada registrada com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "GridCastingDowntimeService.create",
          AppError.badRequest("Apontamento de produção inválido.")
        )
      }

      return this.handleError("GridCastingDowntimeService.create", error)
    }
  }

  async update(
    input: UpdateGridCastingDowntimeSchema
  ): Promise<ActionResponse<GridCastingDowntimeWithProduction>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Parada não encontrada.")
      }

      await this.assertProductionExists(input.production_id)

      const record = await this.repository.update(input.id, {
        production_id: input.production_id,
        reason: input.reason,
        duration_minutes: input.duration_minutes,
        start_time: input.start_time,
        end_time: input.end_time
      })

      const withProduction = await this.attachSingleProduction(record)

      return actionSuccess(withProduction, "Parada atualizada com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "GridCastingDowntimeService.update",
          AppError.badRequest("Apontamento de produção inválido.")
        )
      }

      return this.handleError("GridCastingDowntimeService.update", error)
    }
  }

  private async assertProductionExists(productionId: string): Promise<void> {
    const production = await this.productionRepository.findById(productionId)

    if (!production) {
      throw AppError.badRequest("Selecione um apontamento de produção válido.")
    }
  }

  private async attachSingleProduction(
    record: GridCastingDowntime
  ): Promise<GridCastingDowntimeWithProduction> {
    const production = await this.productionRepository.findById(
      record.production_id
    )

    if (!production) {
      return { ...record, production: null }
    }

    const [shifts, machines, employees, alloys, batteryModels] =
      await Promise.all([
        this.shiftRepository.findAll(),
        this.machineRepository.findAll(true),
        this.employeeRepository.findAll(true),
        this.leadAlloyRepository.findAll(),
        this.batteryModelRepository.findAll()
      ])

    const [withRelations] = this.attachProductionRelations(
      [production],
      shifts,
      machines,
      employees,
      alloys,
      batteryModels
    )

    return {
      ...record,
      production: withRelations ?? null
    }
  }

  private attachProductionRelations(
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
