import { AppError } from "@/lib/errors/app-error"
import { actionSuccess, type ActionResponse } from "@/lib/utils/action-response"
import { AuthRepository } from "@/repositories/auth-repository"
import { LabQualityControlRepository } from "@/repositories/lab-quality-control-repository"
import { MixerProductionRepository } from "@/repositories/mixer-production-repository"
import { BaseService } from "@/services/base-service"
import type { Profile } from "@/types/auth"
import type { MixerProduction } from "@/types/mixer-production"
import type {
  LabQualityControl,
  LabQualityControlListFilters,
  LabQualityControlWithRelations
} from "@/types/lab-quality-control"
import type {
  CreateLabQualityControlSchema,
  UpdateLabQualityControlSchema
} from "@/validations/lab-quality-control/quality-schema"

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23503"
  )
}

export class LabQualityControlService extends BaseService {
  private readonly repository = new LabQualityControlRepository()
  private readonly mixerRepository = new MixerProductionRepository()
  private readonly authRepository = new AuthRepository()

  async list(
    filters?: LabQualityControlListFilters
  ): Promise<ActionResponse<LabQualityControlWithRelations[]>> {
    try {
      const records = await this.repository.findAll(filters)

      const technicianIds = records.map((record) => record.technician_id)
      const sourceIds = records.map((record) => record.source_id)

      const [profiles, mixerRecords] = await Promise.all([
        this.listTechnicianProfiles(technicianIds),
        this.listMixerByIds(sourceIds)
      ])

      return actionSuccess(
        this.attachRelations(records, profiles, mixerRecords)
      )
    } catch (error) {
      return this.handleError("LabQualityControlService.list", error)
    }
  }

  async listFormSamples(
    dateFrom: string,
    linkedSourceIds: string[] = []
  ): Promise<ActionResponse<MixerProduction[]>> {
    try {
      const [recent, linked] = await Promise.all([
        this.mixerRepository.findAll({ dateFrom }),
        this.mixerRepository.findByIds(linkedSourceIds)
      ])

      const byId = new Map<string, MixerProduction>()

      for (const sample of [...recent, ...linked]) {
        byId.set(sample.id, sample)
      }

      const merged = [...byId.values()].sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        if (dateCompare !== 0) {
          return dateCompare
        }

        return b.created_at.localeCompare(a.created_at)
      })

      return actionSuccess(merged.slice(0, 200))
    } catch (error) {
      return this.handleError("LabQualityControlService.listFormSamples", error)
    }
  }

  async create(
    input: CreateLabQualityControlSchema
  ): Promise<ActionResponse<LabQualityControlWithRelations>> {
    try {
      const technicianId = await this.requireTechnicianId()
      await this.assertSampleSource(input.source_id)

      const record = await this.repository.create({
        date: input.date,
        technician_id: technicianId,
        source_id: input.source_id,
        acid_concentration: input.acid_concentration,
        temperature: input.temperature,
        status: input.status,
        notes: input.notes
      })

      const [withRelations] = await this.attachSingleRecord(record)

      return actionSuccess(
        withRelations,
        "Análise laboratorial registrada com sucesso."
      )
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "LabQualityControlService.create",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("LabQualityControlService.create", error)
    }
  }

  async update(
    input: UpdateLabQualityControlSchema
  ): Promise<ActionResponse<LabQualityControlWithRelations>> {
    try {
      const existing = await this.repository.findById(input.id)

      if (!existing) {
        throw AppError.notFound("Análise não encontrada.")
      }

      await this.assertSampleSource(input.source_id)

      const record = await this.repository.update(
        input.id,
        {
          date: input.date,
          source_id: input.source_id,
          acid_concentration: input.acid_concentration,
          temperature: input.temperature,
          status: input.status,
          notes: input.notes
        },
        input.updated_at
      )

      const [withRelations] = await this.attachSingleRecord(record)

      return actionSuccess(withRelations, "Análise atualizada com sucesso.")
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return this.handleError(
          "LabQualityControlService.update",
          AppError.badRequest("Referência inválida nos dados informados.")
        )
      }

      return this.handleError("LabQualityControlService.update", error)
    }
  }

  private async requireTechnicianId(): Promise<string> {
    const {
      data: { user },
      error
    } = await this.authRepository.getUser()

    if (error) {
      throw error
    }

    if (!user) {
      throw AppError.unauthorized("Sessão expirada. Faça login novamente.")
    }

    const profile = await this.authRepository.getProfile(user.id)

    if (!profile?.is_active) {
      throw AppError.unauthorized(
        "Perfil de técnico não encontrado ou inativo."
      )
    }

    return user.id
  }

  private async assertSampleSource(sourceId: string): Promise<void> {
    const sample = await this.mixerRepository.findById(sourceId)

    if (!sample) {
      throw AppError.badRequest(
        "Amostra do misturador informada não foi encontrada."
      )
    }
  }

  private async attachSingleRecord(
    record: LabQualityControl
  ): Promise<LabQualityControlWithRelations[]> {
    const profiles = await this.listTechnicianProfiles([record.technician_id])
    const sample = await this.mixerRepository.findById(record.source_id)
    const mixerRecords = sample ? [sample] : []

    return this.attachRelations([record], profiles, mixerRecords)
  }

  private async listTechnicianProfiles(
    technicianIds: string[]
  ): Promise<Profile[]> {
    return this.authRepository.findProfilesByIds(technicianIds)
  }

  private async listMixerByIds(
    sourceIds: string[]
  ): Promise<MixerProduction[]> {
    return this.mixerRepository.findByIds(sourceIds)
  }

  private attachRelations(
    records: LabQualityControl[],
    profiles: Profile[],
    mixerRecords: MixerProduction[]
  ): LabQualityControlWithRelations[] {
    const profileById = new Map(
      profiles.map((profile) => [
        profile.id,
        { id: profile.id, full_name: profile.full_name }
      ])
    )

    const sampleById = new Map(
      mixerRecords.map((sample) => [
        sample.id,
        {
          id: sample.id,
          batch_number: sample.batch_number,
          date: sample.date
        }
      ])
    )

    return records.map((record) => ({
      ...record,
      technician: profileById.get(record.technician_id) ?? null,
      sample: sampleById.get(record.source_id) ?? null
    }))
  }
}
