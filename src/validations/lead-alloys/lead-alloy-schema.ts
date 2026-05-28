import { z } from "zod"

export const leadAlloyFormSchema = z.object({
  code: z
    .string()
    .min(1, "Código é obrigatório.")
    .max(50, "Código deve ter no máximo 50 caracteres.")
    .trim(),
  description: z
    .string()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres.")
    .trim()
    .transform((value) => (value === "" ? null : value))
})

export const createLeadAlloySchema = leadAlloyFormSchema

export const updateLeadAlloySchema = leadAlloyFormSchema.extend({
  id: z.string().uuid("ID inválido."),
  updated_at: z.string().min(1, "Registro desatualizado. Recarregue a página.")
})

export type LeadAlloyFormInput = z.input<typeof leadAlloyFormSchema>
export type LeadAlloyFormSchema = z.infer<typeof leadAlloyFormSchema>
export type CreateLeadAlloySchema = z.infer<typeof createLeadAlloySchema>
export type UpdateLeadAlloySchema = z.infer<typeof updateLeadAlloySchema>
