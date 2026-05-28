import { z } from "zod"

const weightSchema = z.coerce
  .number({ invalid_type_error: "Informe um peso válido." })
  .positive("O peso deve ser maior que zero.")
  .max(9999999.999, "Peso fora do limite permitido.")

const volumeSchema = z.coerce
  .number({ invalid_type_error: "Informe um volume válido." })
  .positive("O volume deve ser maior que zero.")
  .max(10000, "Volume fora do limite permitido.")

const densitySchema = z.coerce
  .number({ invalid_type_error: "Informe uma densidade válida." })
  .positive("A densidade deve ser maior que zero.")
  .min(0.5, "Densidade fora da faixa permitida.")
  .max(2.5, "Densidade fora da faixa permitida.")

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

const mixerBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  shift_id: uuidSchema("Turno"),
  operator_id: uuidSchema("Operador"),
  batch_number: z
    .string({ required_error: "Número da batelada é obrigatório." })
    .min(1, "Número da batelada é obrigatório.")
    .max(50, "Número da batelada deve ter no máximo 50 caracteres.")
    .trim(),
  lead_ball_weight: weightSchema,
  oxide_weight: weightSchema,
  water_volume: volumeSchema,
  acid_volume: volumeSchema,
  density: densitySchema
})

export const mixerFormSchema = mixerBaseSchema

export const createMixerSchema = mixerBaseSchema

export const updateMixerSchema = mixerBaseSchema.and(
  z.object({
    id: z.string().uuid("ID inválido."),
    updated_at: z
      .string()
      .min(1, "Registro desatualizado. Recarregue a página.")
  })
)

export const mixerListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  shiftId: z.string().uuid("Turno inválido.").optional().or(z.literal("")),
  batchNumber: z.string().max(50).optional().or(z.literal(""))
})

export type MixerFormSchema = z.infer<typeof mixerFormSchema>
export type CreateMixerSchema = z.infer<typeof createMixerSchema>
export type UpdateMixerSchema = z.infer<typeof updateMixerSchema>
export type MixerListFiltersSchema = z.infer<typeof mixerListFiltersSchema>
