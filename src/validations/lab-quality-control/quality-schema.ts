import { z } from "zod"

import { LAB_QC_STATUSES } from "@/types/lab-quality-control"

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

function nullableNumericField(label: string, min: number, max: number) {
  return z
    .union([
      z.literal(""),
      z.literal(null),
      z.coerce
        .number({
          invalid_type_error: `Informe um valor válido para ${label.toLowerCase()}.`
        })
        .min(min, `${label} deve ser no mínimo ${min}.`)
        .max(max, `${label} deve ser no máximo ${max}.`)
    ])
    .transform((value) => (value === "" || value === null ? null : value))
}

const labQualityControlBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  source_id: uuidSchema("Amostra do misturador"),
  acid_concentration: nullableNumericField("Concentração de ácido", 0, 100),
  temperature: nullableNumericField("Temperatura", -50, 150),
  status: z.enum(LAB_QC_STATUSES, {
    required_error: "Status é obrigatório.",
    invalid_type_error: "Status inválido."
  }),
  notes: z
    .string()
    .max(500, "Observações devem ter no máximo 500 caracteres.")
    .optional()
    .or(z.literal(""))
})

const labQualityControlPersistSchema = labQualityControlBaseSchema.transform(
  (data) => ({
    ...data,
    notes: data.notes?.trim() ? data.notes.trim() : null
  })
)

export const labQualityControlFormSchema = labQualityControlBaseSchema

export const createLabQualityControlSchema = labQualityControlPersistSchema

export const updateLabQualityControlSchema = labQualityControlPersistSchema.and(
  z.object({
    id: z.string().uuid("ID inválido."),
    updated_at: z
      .string()
      .min(1, "Registro desatualizado. Recarregue a página.")
  })
)

export const labQualityControlListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(LAB_QC_STATUSES).optional().or(z.literal(""))
})

export type LabQualityControlFormInput = z.input<
  typeof labQualityControlFormSchema
>
export type LabQualityControlFormSchema = z.output<
  typeof labQualityControlFormSchema
>
export type CreateLabQualityControlSchema = z.infer<
  typeof createLabQualityControlSchema
>
export type UpdateLabQualityControlSchema = z.infer<
  typeof updateLabQualityControlSchema
>
export type LabQualityControlListFiltersSchema = z.infer<
  typeof labQualityControlListFiltersSchema
>
