import { z } from "zod"

const scrapWeightSchema = z.coerce
  .number({ invalid_type_error: "Informe um peso válido." })
  .positive("O peso de refugo deve ser maior que zero.")
  .max(9999999.999, "Peso fora do limite permitido.")

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

const sandingScrapBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  operator_id: uuidSchema("Operador"),
  scrap_weight: scrapWeightSchema,
  plates_qty_lost: z.coerce
    .number({ invalid_type_error: "Informe uma quantidade válida." })
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade de placas perdidas deve ser maior que zero.")
})

export const sandingScrapFormSchema = sandingScrapBaseSchema

export const createSandingScrapSchema = sandingScrapBaseSchema

export const updateSandingScrapSchema = sandingScrapBaseSchema.and(
  z.object({
    id: z.string().uuid("ID inválido.")
  })
)

export const sandingScrapListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  operatorId: z.string().uuid("Operador inválido.").optional().or(z.literal(""))
})

export type SandingScrapFormSchema = z.infer<typeof sandingScrapFormSchema>
export type CreateSandingScrapSchema = z.infer<typeof createSandingScrapSchema>
export type UpdateSandingScrapSchema = z.infer<typeof updateSandingScrapSchema>
export type SandingScrapListFiltersSchema = z.infer<
  typeof sandingScrapListFiltersSchema
>
