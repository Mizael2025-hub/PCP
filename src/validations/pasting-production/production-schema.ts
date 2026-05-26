import { z } from "zod"

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

const pastingBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  shift_id: uuidSchema("Turno"),
  machine_id: uuidSchema("Máquina"),
  operator_id: uuidSchema("Operador"),
  battery_model_id: uuidSchema("Modelo de bateria"),
  plates_qty: z.coerce
    .number({ invalid_type_error: "Informe uma quantidade válida." })
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade de placas deve ser maior que zero.")
})

export const pastingFormSchema = pastingBaseSchema.extend({
  sector_id: uuidSchema("Setor")
})

export const createPastingSchema = pastingBaseSchema

export const updatePastingSchema = pastingBaseSchema.and(
  z.object({
    id: z.string().uuid("ID inválido.")
  })
)

export const pastingListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  shiftId: z.string().uuid("Turno inválido.").optional().or(z.literal("")),
  epCode: z.string().max(100).optional().or(z.literal("")),
  batteryModelId: z
    .string()
    .uuid("Modelo inválido.")
    .optional()
    .or(z.literal(""))
})

export type PastingFormSchema = z.infer<typeof pastingFormSchema>
export type CreatePastingSchema = z.infer<typeof createPastingSchema>
export type UpdatePastingSchema = z.infer<typeof updatePastingSchema>
export type PastingListFiltersSchema = z.infer<typeof pastingListFiltersSchema>
