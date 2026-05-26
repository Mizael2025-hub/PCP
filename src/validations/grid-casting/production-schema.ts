import { z } from "zod"

const weightSchema = z.coerce
  .number({ invalid_type_error: "Informe um peso válido." })
  .positive("O peso deve ser maior que zero.")
  .max(9999999.999, "Peso fora do limite permitido.")

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

const gridCastingBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  shift_id: uuidSchema("Turno"),
  machine_id: uuidSchema("Máquina"),
  operator_id: uuidSchema("Operador"),
  alloy_id: uuidSchema("Liga"),
  battery_model_id: uuidSchema("Modelo de bateria"),
  gross_weight: weightSchema,
  net_weight: weightSchema,
  produced_qty: z.coerce
    .number({ invalid_type_error: "Informe uma quantidade válida." })
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade produzida deve ser maior que zero.")
})

const weightRefinement = (
  data: z.infer<typeof gridCastingBaseSchema>,
  ctx: z.RefinementCtx
) => {
  if (data.net_weight > data.gross_weight) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Peso líquido não pode ser maior que o peso bruto.",
      path: ["net_weight"]
    })
  }
}

export const gridCastingFormSchema = gridCastingBaseSchema
  .extend({
    sector_id: uuidSchema("Setor")
  })
  .superRefine(weightRefinement)

export const createGridCastingSchema =
  gridCastingBaseSchema.superRefine(weightRefinement)

export const updateGridCastingSchema = createGridCastingSchema.and(
  z.object({
    id: z.string().uuid("ID inválido.")
  })
)

export const gridCastingListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  shiftId: z.string().uuid("Turno inválido.").optional().or(z.literal(""))
})

export type GridCastingFormSchema = z.infer<typeof gridCastingFormSchema>
export type CreateGridCastingSchema = z.infer<typeof createGridCastingSchema>
export type UpdateGridCastingSchema = z.infer<typeof updateGridCastingSchema>
export type GridCastingListFiltersSchema = z.infer<
  typeof gridCastingListFiltersSchema
>
