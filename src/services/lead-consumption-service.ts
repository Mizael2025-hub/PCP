import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { LeadAlloyRepository } from "@/repositories/lead-alloy-repository"
import { LeadConsumptionRepository } from "@/repositories/lead-consumption-repository"
import { SectorRepository } from "@/repositories/sector-repository"
import { BaseService } from "@/services/base-service"
import type { LeadAlloy } from "@/types/lead-alloy"
import type {
  LeadConsumption,
  LeadConsumptionDailySummary,
  LeadConsumptionGroupSummary,
  LeadConsumptionListFilters,
  LeadConsumptionWithRelations
} from "@/types/lead-consumption"
import type { Sector } from "@/types/sector"
import type {
  CreateLeadConsumptionSchema,
  UpdateLeadConsumptionSchema
} from "@/validations/lead-consumption/consumption-schema"

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class LeadConsumptionService extends BaseService {
  private readonly repository = new LeadConsumptionRepository()
  private readonly alloyRepository = new LeadAlloyRepository()
  private readonly sectorRepository = new SectorRepository()

  async list(
    filters?: LeadConsumptionListFilters
  ): Promise<ActionResponse<LeadConsumptionWithRelations[]>> {
    try {
      const [records, alloys, sectors] = await Promise.all([
        this.repository.findAll(filters),
        this.alloyRepository.findAll(),
        this.sectorRepository.findAll(true)
      ])

      return actionSuccess(this.attachRelations(records, alloys, sectors))
    } catch (error) {
      return this.handleError("LeadConsumptionService.list", error)
    }
  }

  async create(
    input: CreateLeadConsumptionSchema
  ): Promise<ActionResponse<LeadConsumptionWithRelations>> {
    try {
      await this.assertReferences(input)

      const record = await this.repository.create({
        date: input.date,
        alloy_id: input.alloy_id,
        destination_sector_id: input.destination_sector_id,
        weight_consumed: input.weight_consumed
      })

      const [alloys, sectors] = await Promise.all([
        this.alloyRepository.findAll(),
        this.sectorRepository.findAll(true)
      ])

      const [withRelations] = this.attachRelations([record], alloys, sectors)

      return actionSuccess(
        withRelations,
        "Consumo de chumbo registrado com sucesso."
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "LeadConsumptionService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("LeadConsumptionService.create", error)
    }
  }

  async update(
    input: UpdateLeadConsumptionSchema
  ): Promise<ActionResponse<LeadConsumptionWithRelations>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Apontamento não encontrado.")
      }

      await this.assertReferences(input)

      const record = await this.repository.update(input.id, {
        date: input.date,
        alloy_id: input.alloy_id,
        destination_sector_id: input.destination_sector_id,
        weight_consumed: input.weight_consumed
      })

      const [alloys, sectors] = await Promise.all([
        this.alloyRepository.findAll(),
        this.sectorRepository.findAll(true)
      ])

      const [withRelations] = this.attachRelations([record], alloys, sectors)

      return actionSuccess(withRelations, "Apontamento atualizado com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "LeadConsumptionService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("LeadConsumptionService.update", error)
    }
  }

  buildDailySummary(
    records: LeadConsumptionWithRelations[]
  ): LeadConsumptionDailySummary[] {
    const byDate = new Map<string, { totalWeight: number; count: number }>()

    for (const record of records) {
      const current = byDate.get(record.date) ?? { totalWeight: 0, count: 0 }
      current.totalWeight += record.weight_consumed
      current.count += 1
      byDate.set(record.date, current)
    }

    return Array.from(byDate.entries())
      .map(([date, stats]) => ({
        date,
        totalWeight: stats.totalWeight,
        recordCount: stats.count
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14)
      .reverse()
  }

  buildAlloySummary(
    records: LeadConsumptionWithRelations[]
  ): LeadConsumptionGroupSummary[] {
    const byAlloy = new Map<
      string,
      { label: string; totalWeight: number; count: number }
    >()

    for (const record of records) {
      const id = record.alloy_id
      const label = record.lead_alloys?.code ?? "Sem liga"
      const current = byAlloy.get(id) ?? { label, totalWeight: 0, count: 0 }
      current.totalWeight += record.weight_consumed
      current.count += 1
      byAlloy.set(id, current)
    }

    return Array.from(byAlloy.entries())
      .map(([id, stats]) => ({
        id,
        label: stats.label,
        totalWeight: stats.totalWeight,
        recordCount: stats.count
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 8)
  }

  buildSectorSummary(
    records: LeadConsumptionWithRelations[]
  ): LeadConsumptionGroupSummary[] {
    const bySector = new Map<
      string,
      { label: string; totalWeight: number; count: number }
    >()

    for (const record of records) {
      const id = record.destination_sector_id
      const label = record.sectors?.name ?? "Sem setor"
      const current = bySector.get(id) ?? { label, totalWeight: 0, count: 0 }
      current.totalWeight += record.weight_consumed
      current.count += 1
      bySector.set(id, current)
    }

    return Array.from(bySector.entries())
      .map(([id, stats]) => ({
        id,
        label: stats.label,
        totalWeight: stats.totalWeight,
        recordCount: stats.count
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 8)
  }

  private async assertReferences(
    input: CreateLeadConsumptionSchema
  ): Promise<void> {
    const [alloy, sector] = await Promise.all([
      this.alloyRepository.findById(input.alloy_id),
      this.sectorRepository.findById(input.destination_sector_id)
    ])

    if (!alloy) {
      throw AppError.badRequest("Liga informada não é válida.")
    }

    if (!sector || !sector.is_active) {
      throw AppError.badRequest("Setor de destino informado não está ativo.")
    }
  }

  private attachRelations(
    records: LeadConsumption[],
    alloys: LeadAlloy[],
    sectors: Sector[]
  ): LeadConsumptionWithRelations[] {
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
    const sectorById = new Map(
      sectors.map((sector) => [sector.id, { id: sector.id, name: sector.name }])
    )

    return records.map((record) => ({
      ...record,
      lead_alloys: alloyById.get(record.alloy_id) ?? null,
      sectors: sectorById.get(record.destination_sector_id) ?? null
    }))
  }
}
