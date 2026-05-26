import { z } from "zod"

const oxideWeightSchema = z.coerce
  .number({ invalid_type_error: "Informe um peso válido." })
  .positive("O peso de óxido deve ser maior que zero.")
  .max(9999999.999, "Peso fora do limite permitido.")

const oxidationDegreeSchema = z.coerce
  .number({ invalid_type_error: "Informe um grau de oxidação válido." })
  .positive("O grau de oxidação deve ser maior que zero.")
  .max(100, "O grau de oxidação não pode exceder 100%.")

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

const oxideMillBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  shift_id: uuidSchema("Turno"),
  operator_id: uuidSchema("Operador"),
  oxide_weight: oxideWeightSchema,
  oxidation_degree: oxidationDegreeSchema
})

export const oxideMillFormSchema = oxideMillBaseSchema

export const createOxideMillSchema = oxideMillBaseSchema

export const updateOxideMillSchema = oxideMillBaseSchema.and(
  z.object({
    id: z.string().uuid("ID inválido.")
  })
)

export const oxideMillListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  shiftId: z.string().uuid("Turno inválido.").optional().or(z.literal(""))
})

export type OxideMillFormSchema = z.infer<typeof oxideMillFormSchema>
export type CreateOxideMillSchema = z.infer<typeof createOxideMillSchema>
export type UpdateOxideMillSchema = z.infer<typeof updateOxideMillSchema>
export type OxideMillListFiltersSchema = z.infer<
  typeof oxideMillListFiltersSchema
>
