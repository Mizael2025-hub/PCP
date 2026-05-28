import { z } from "zod"

const weightSchema = z.coerce
  .number({ invalid_type_error: "Informe um peso válido." })
  .positive("O peso consumido deve ser maior que zero.")
  .max(9999999.999, "Peso fora do limite permitido.")

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

const leadConsumptionBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  alloy_id: uuidSchema("Liga"),
  destination_sector_id: uuidSchema("Setor de destino"),
  weight_consumed: weightSchema
})

export const leadConsumptionFormSchema = leadConsumptionBaseSchema

export const createLeadConsumptionSchema = leadConsumptionBaseSchema

export const updateLeadConsumptionSchema = leadConsumptionBaseSchema.and(
  z.object({
    id: z.string().uuid("ID inválido."),
    updated_at: z
      .string()
      .min(1, "Registro desatualizado. Recarregue a página.")
  })
)

export const leadConsumptionListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  alloyId: z.string().uuid("Liga inválida.").optional().or(z.literal("")),
  destinationSectorId: z
    .string()
    .uuid("Setor inválido.")
    .optional()
    .or(z.literal(""))
})

export type LeadConsumptionFormSchema = z.infer<
  typeof leadConsumptionFormSchema
>
export type CreateLeadConsumptionSchema = z.infer<
  typeof createLeadConsumptionSchema
>
export type UpdateLeadConsumptionSchema = z.infer<
  typeof updateLeadConsumptionSchema
>
export type LeadConsumptionListFiltersSchema = z.infer<
  typeof leadConsumptionListFiltersSchema
>
