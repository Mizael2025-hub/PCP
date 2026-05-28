import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { formatBatteryLotCode } from "@/lib/utils/battery-lot-code"
import { characteristicsToJson } from "@/lib/utils/lot-characteristics"
import { AssemblyProductionRepository } from "@/repositories/assembly-production-repository"
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
  AssemblyListFilters,
  AssemblyProduction,
  AssemblyProductionWithRelations
} from "@/types/assembly-production"
import type { PastingProduction } from "@/types/pasting-production"
import type { Shift } from "@/types/shift"
import type {
  CreateAssemblySchema,
  UpdateAssemblySchema
} from "@/validations/assembly-production/production-schema"

const MAX_LOT_CODE_RETRIES = 3

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

export class AssemblyProductionService extends BaseService {
  private readonly repository = new AssemblyProductionRepository()
  private readonly pastingRepository = new PastingProductionRepository()
  private readonly shiftRepository = new ShiftRepository()
  private readonly machineRepository = new MachineRepository()
  private readonly employeeRepository = new EmployeeRepository()
  private readonly batteryModelRepository = new BatteryModelRepository()

  async list(
    filters?: AssemblyListFilters
  ): Promise<ActionResponse<AssemblyProductionWithRelations[]>> {
    try {
      const resolvedFilters = await this.resolveListFilters(filters)

      if (
        filters?.epCode &&
        resolvedFilters?.pastingProductionIds?.length === 0
      ) {
        return actionSuccess([])
      }

      const [
        records,
        shifts,
        machines,
        employees,
        pastingRecords,
        batteryModels
      ] = await Promise.all([
        this.repository.findAll(resolvedFilters),
        this.shiftRepository.findAll(),
        this.machineRepository.findAll(true),
        this.employeeRepository.findAll(true),
        this.pastingRepository.findAll(),
        this.batteryModelRepository.findAll()
      ])

      return actionSuccess(
        this.attachRelations(
          records,
          shifts,
          machines,
          employees,
          pastingRecords,
          batteryModels
        )
      )
    } catch (error) {
      return this.handleError("AssemblyProductionService.list", error)
    }
  }

  async listAvailablePasting(
    excludeAssemblyId?: string
  ): Promise<ActionResponse<PastingProduction[]>> {
    try {
      const [allPasting, linkedIds] = await Promise.all([
        this.pastingRepository.findAll(),
        this.repository.findLinkedPastingIds(excludeAssemblyId)
      ])

      const linkedSet = new Set(linkedIds)
      const available = allPasting.filter((record) => !linkedSet.has(record.id))

      return actionSuccess(available)
    } catch (error) {
      return this.handleError(
        "AssemblyProductionService.listAvailablePasting",
        error
      )
    }
  }

  async create(
    input: CreateAssemblySchema
  ): Promise<ActionResponse<AssemblyProductionWithRelations>> {
    try {
      const { pasting, batteryModel } = await this.assertReferences(input)
      const lotCharacteristics = characteristicsToJson(input.characteristics)

      let record: AssemblyProduction | null = null
      let lastError: unknown

      for (let attempt = 0; attempt < MAX_LOT_CODE_RETRIES; attempt++) {
        const batteryLotCode = await this.generateBatteryLotCode(
          input.date,
          pasting.battery_model_id,
          batteryModel.code,
          attempt
        )

        try {
          record = await this.repository.create({
            battery_lot_code: batteryLotCode,
            pasting_production_id: input.pasting_production_id,
            date: input.date,
            shift_id: input.shift_id,
            machine_id: input.machine_id,
            operator_id: input.operator_id,
            produced_qty: input.produced_qty,
            lot_characteristics: lotCharacteristics
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
          "AssemblyProductionService.create",
          lastError ??
            AppError.badRequest("Não foi possível gerar o lote da bateria.")
        )
      }

      const [shifts, machines, employees, pastingRecords, batteryModels] =
        await Promise.all([
          this.shiftRepository.findAll(),
          this.machineRepository.findAll(true),
          this.employeeRepository.findAll(true),
          this.pastingRepository.findAll(),
          this.batteryModelRepository.findAll()
        ])

      const [withRelations] = this.attachRelations(
        [record],
        shifts,
        machines,
        employees,
        pastingRecords,
        batteryModels
      )

      return actionSuccess(
        withRelations,
        `Montagem registrada com sucesso. Lote: ${record.battery_lot_code}`
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "AssemblyProductionService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("AssemblyProductionService.create", error)
    }
  }

  async update(
    input: UpdateAssemblySchema
  ): Promise<ActionResponse<AssemblyProductionWithRelations>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Apontamento não encontrado.")
      }

      if (input.pasting_production_id !== existing.pasting_production_id) {
        throw AppError.badRequest(
          "O EP Code de origem não pode ser alterado após o registro."
        )
      }

      await this.assertReferences(input, existing.id)

      const record = await this.repository.update(
        input.id,
        {
          date: input.date,
          shift_id: input.shift_id,
          machine_id: input.machine_id,
          operator_id: input.operator_id,
          produced_qty: input.produced_qty,
          lot_characteristics: characteristicsToJson(input.characteristics)
        },
        input.updated_at
      )

      const [shifts, machines, employees, pastingRecords, batteryModels] =
        await Promise.all([
          this.shiftRepository.findAll(),
          this.machineRepository.findAll(true),
          this.employeeRepository.findAll(true),
          this.pastingRepository.findAll(),
          this.batteryModelRepository.findAll()
        ])

      const [withRelations] = this.attachRelations(
        [record],
        shifts,
        machines,
        employees,
        pastingRecords,
        batteryModels
      )

      return actionSuccess(withRelations, "Apontamento atualizado com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "AssemblyProductionService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("AssemblyProductionService.update", error)
    }
  }

  private async resolveListFilters(
    filters?: AssemblyListFilters
  ): Promise<AssemblyListFilters | undefined> {
    if (!filters?.epCode) {
      return filters
    }

    const pastingRecords = await this.pastingRepository.findAll({
      epCode: filters.epCode
    })

    const pastingProductionIds = pastingRecords.map((record) => record.id)

    return {
      ...filters,
      pastingProductionIds:
        pastingProductionIds.length > 0 ? pastingProductionIds : []
    }
  }

  private async generateBatteryLotCode(
    date: string,
    batteryModelId: string,
    modelCode: string,
    retryOffset: number
  ): Promise<string> {
    const count = await this.repository.countByDateAndPastingModel(
      date,
      batteryModelId
    )

    return formatBatteryLotCode(modelCode, date, count + 1 + retryOffset)
  }

  private async assertReferences(
    input: CreateAssemblySchema,
    excludeAssemblyId?: string
  ): Promise<{ pasting: PastingProduction; batteryModel: BatteryModel }> {
    const [shift, machine, operator, pasting, linkedIds] = await Promise.all([
      this.shiftRepository.findById(input.shift_id),
      this.machineRepository.findById(input.machine_id),
      this.employeeRepository.findById(input.operator_id),
      this.pastingRepository.findById(input.pasting_production_id),
      this.repository.findLinkedPastingIds(excludeAssemblyId)
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

    if (!pasting) {
      throw AppError.badRequest("EP Code de origem não encontrado.")
    }

    if (linkedIds.includes(input.pasting_production_id)) {
      throw AppError.badRequest(
        "Este EP Code já está vinculado a outro lote de montagem."
      )
    }

    const batteryModel = await this.batteryModelRepository.findById(
      pasting.battery_model_id
    )

    if (!batteryModel) {
      throw AppError.badRequest("Modelo de bateria do EP Code não é válido.")
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

    return { pasting, batteryModel }
  }

  private attachRelations(
    records: AssemblyProduction[],
    shifts: Shift[],
    machines: Machine[],
    employees: Employee[],
    pastingRecords: PastingProduction[],
    batteryModels: BatteryModel[]
  ): AssemblyProductionWithRelations[] {
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
    const pastingById = new Map(
      pastingRecords.map((record) => [
        record.id,
        {
          id: record.id,
          ep_code: record.ep_code,
          date: record.date,
          battery_model_id: record.battery_model_id,
          plates_qty: record.plates_qty,
          created_at: record.created_at,
          updated_at: record.updated_at,
          created_by: record.created_by
        }
      ])
    )
    const batteryModelById = new Map(
      batteryModels.map((model) => [
        model.id,
        {
          id: model.id,
          code: model.code,
          name: model.name
        }
      ])
    )

    return records.map((record) => {
      const pasting = pastingById.get(record.pasting_production_id) ?? null

      return {
        ...record,
        shifts: shiftById.get(record.shift_id) ?? null,
        machines: machineById.get(record.machine_id) ?? null,
        employees: employeeById.get(record.operator_id) ?? null,
        pasting_production: pasting,
        battery_models: pasting
          ? (batteryModelById.get(pasting.battery_model_id) ?? null)
          : null,
        lot_characteristics: record.lot_characteristics
      }
    })
  }
}
