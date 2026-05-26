import { z } from "zod"

const weightSchema = z.coerce
  .number({ invalid_type_error: "Informe um peso válido." })
  .positive("O peso deve ser maior que zero.")
  .max(9999999.999, "Peso fora do limite permitido.")

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

const leadBallBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  shift_id: uuidSchema("Turno"),
  operator_id: uuidSchema("Operador"),
  weight_produced: weightSchema,
  silo_number: z.coerce
    .number({ invalid_type_error: "Informe um número de silo válido." })
    .int("O número do silo deve ser inteiro.")
    .positive("O número do silo deve ser maior que zero.")
    .max(999, "Número do silo fora do limite permitido.")
})

export const leadBallFormSchema = leadBallBaseSchema

export const createLeadBallSchema = leadBallBaseSchema

export const updateLeadBallSchema = leadBallBaseSchema.and(
  z.object({
    id: z.string().uuid("ID inválido.")
  })
)

export const leadBallListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  shiftId: z.string().uuid("Turno inválido.").optional().or(z.literal("")),
  siloNumber: z.coerce.number().int().positive().optional().or(z.literal(""))
})

export type LeadBallFormSchema = z.infer<typeof leadBallFormSchema>
export type CreateLeadBallSchema = z.infer<typeof createLeadBallSchema>
export type UpdateLeadBallSchema = z.infer<typeof updateLeadBallSchema>
export type LeadBallListFiltersSchema = z.infer<
  typeof leadBallListFiltersSchema
>
