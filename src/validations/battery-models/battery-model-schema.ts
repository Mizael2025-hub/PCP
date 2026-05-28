import { z } from "zod"

const weightSpecificationSchema = z
  .string()
  .min(1, "Peso nominal é obrigatório.")
  .transform((value) => value.replace(",", ".").trim())
  .pipe(
    z.coerce
      .number({ invalid_type_error: "Peso inválido." })
      .positive("Peso deve ser maior que zero.")
      .max(9999999.999, "Peso excede o limite permitido.")
  )

export const batteryModelFormSchema = z.object({
  code: z
    .string()
    .min(1, "Código é obrigatório.")
    .max(50, "Código deve ter no máximo 50 caracteres.")
    .trim(),
  name: z
    .string()
    .min(1, "Nome é obrigatório.")
    .max(100, "Nome deve ter no máximo 100 caracteres.")
    .trim(),
  weight_specification: weightSpecificationSchema
})

export const createBatteryModelSchema = batteryModelFormSchema

export const updateBatteryModelSchema = batteryModelFormSchema.extend({
  id: z.string().uuid("ID inválido."),
  updated_at: z.string().min(1, "Registro desatualizado. Recarregue a página.")
})

export type BatteryModelFormInput = z.input<typeof batteryModelFormSchema>
export type BatteryModelFormSchema = z.infer<typeof batteryModelFormSchema>
export type CreateBatteryModelSchema = z.infer<typeof createBatteryModelSchema>
export type UpdateBatteryModelSchema = z.infer<typeof updateBatteryModelSchema>
