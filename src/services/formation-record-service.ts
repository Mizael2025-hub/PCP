import { format, parseISO } from "date-fns"

import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { datetimeLocalToIso } from "@/lib/utils/datetime"
import { formatFormationLotCode } from "@/lib/utils/formation-lot-code"
import { AssemblyProductionRepository } from "@/repositories/assembly-production-repository"
import { EmployeeRepository } from "@/repositories/employee-repository"
import { FormationDetailRepository } from "@/repositories/formation-detail-repository"
import { FormationRecordRepository } from "@/repositories/formation-record-repository"
import { BaseService } from "@/services/base-service"
import type { Employee } from "@/types/employee"
import type {
  FormationDetail,
  FormationDetailInsert,
  FormationListFilters,
  FormationRecord,
  FormationRecordWithRelations
} from "@/types/formation-record"
import type {
  CreateFormationRecordSchema,
  FormationDetailLineSchema,
  UpdateFormationRecordSchema
} from "@/validations/formation-records/formation-schema"

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

export class FormationRecordService extends BaseService {
  private readonly recordRepository = new FormationRecordRepository()
  private readonly detailRepository = new FormationDetailRepository()
  private readonly employeeRepository = new EmployeeRepository()
  private readonly assemblyRepository = new AssemblyProductionRepository()

  async list(
    filters?: FormationListFilters
  ): Promise<ActionResponse<FormationRecordWithRelations[]>> {
    try {
      const [records, employees] = await Promise.all([
        this.recordRepository.findAll(filters),
        this.employeeRepository.findAll(true)
      ])

      const formationIds = records.map((record) => record.id)
      const details =
        await this.detailRepository.findByFormationIds(formationIds)

      return actionSuccess(this.attachRelations(records, employees, details))
    } catch (error) {
      return this.handleError("FormationRecordService.list", error)
    }
  }

  async listBatteryLotCodes(): Promise<ActionResponse<string[]>> {
    try {
      const codes = await this.assemblyRepository.listBatteryLotCodes()

      return actionSuccess(codes)
    } catch (error) {
      return this.handleError(
        "FormationRecordService.listBatteryLotCodes",
        error
      )
    }
  }

  async create(
    input: CreateFormationRecordSchema
  ): Promise<ActionResponse<FormationRecordWithRelations>> {
    try {
      await this.assertReferences(input)

      const startIso = datetimeLocalToIso(input.start_date)
      const endIso = input.end_date ? datetimeLocalToIso(input.end_date) : null
      const dateKey = format(parseISO(startIso), "yyyy-MM-dd")

      let record: FormationRecord | null = null
      let lastError: unknown

      for (let attempt = 0; attempt < MAX_LOT_CODE_RETRIES; attempt++) {
        const formationLotCode = await this.generateFormationLotCode(
          dateKey,
          attempt
        )

        try {
          record = await this.recordRepository.create({
            formation_lot_code: formationLotCode,
            start_date: startIso,
            end_date: endIso,
            operator_id: input.operator_id,
            status: input.status
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
          "FormationRecordService.create",
          lastError ??
            AppError.badRequest("Não foi possível gerar o lote de formação.")
        )
      }

      const details = await this.detailRepository.replaceForFormation(
        record.id,
        this.mapLinesToInsert(input.lines)
      )

      const employees = await this.employeeRepository.findAll(true)
      const [withRelations] = this.attachRelations([record], employees, details)

      return actionSuccess(
        withRelations,
        `Formação registrada com sucesso. Lote: ${record.formation_lot_code}`
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "FormationRecordService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("FormationRecordService.create", error)
    }
  }

  async update(
    input: UpdateFormationRecordSchema
  ): Promise<ActionResponse<FormationRecordWithRelations>> {
    try {
      const existing = await this.recordRepository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Formação não encontrada.")
      }

      await this.assertReferences(input)

      const startIso = datetimeLocalToIso(input.start_date)
      const endIso = input.end_date ? datetimeLocalToIso(input.end_date) : null

      const record = await this.recordRepository.update(input.id, {
        start_date: startIso,
        end_date: endIso,
        operator_id: input.operator_id,
        status: input.status
      })

      const details = await this.detailRepository.replaceForFormation(
        record.id,
        this.mapLinesToInsert(input.lines)
      )

      const employees = await this.employeeRepository.findAll(true)
      const [withRelations] = this.attachRelations([record], employees, details)

      return actionSuccess(withRelations, "Formação atualizada com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "FormationRecordService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("FormationRecordService.update", error)
    }
  }

  private mapLinesToInsert(
    lines: FormationDetailLineSchema[]
  ): Omit<FormationDetailInsert, "formation_id">[] {
    return lines.map((line) => ({
      circuit_number: line.circuit_number,
      battery_lot_code: line.battery_lot_code.trim(),
      initial_voltage: line.initial_voltage,
      final_voltage: line.final_voltage,
      current_ampere: line.current_ampere
    }))
  }

  private async generateFormationLotCode(
    date: string,
    retryOffset = 0
  ): Promise<string> {
    const count = await this.recordRepository.countByStartDate(date)

    return formatFormationLotCode(date, count + 1 + retryOffset)
  }

  private async assertReferences(
    input: CreateFormationRecordSchema
  ): Promise<void> {
    const operator = await this.employeeRepository.findById(input.operator_id)

    if (!operator || !operator.is_active) {
      throw AppError.badRequest("Operador informado não está ativo.")
    }

    const lotCodes = await this.assemblyRepository.listBatteryLotCodes()
    const lotSet = new Set(lotCodes.map((code) => code.toUpperCase()))

    for (const line of input.lines) {
      const normalized = line.battery_lot_code.trim().toUpperCase()

      if (!lotSet.has(normalized)) {
        throw AppError.badRequest(
          `Lote de bateria "${line.battery_lot_code}" não encontrado na montagem.`
        )
      }
    }
  }

  private attachRelations(
    records: FormationRecord[],
    employees: Employee[],
    details: FormationDetail[]
  ): FormationRecordWithRelations[] {
    const employeeById = new Map(
      employees.map((employee) => [
        employee.id,
        { id: employee.id, name: employee.name }
      ])
    )

    const detailsByFormation = new Map<string, FormationDetail[]>()

    for (const detail of details) {
      const current = detailsByFormation.get(detail.formation_id) ?? []
      current.push(detail)
      detailsByFormation.set(detail.formation_id, current)
    }

    return records.map((record) => ({
      ...record,
      employees: employeeById.get(record.operator_id) ?? null,
      details: (detailsByFormation.get(record.id) ?? []).sort(
        (a, b) => a.circuit_number - b.circuit_number
      )
    }))
  }
}
