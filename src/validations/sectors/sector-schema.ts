import { z } from "zod"

export const sectorFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório.")
    .max(100, "Nome deve ter no máximo 100 caracteres.")
    .trim()
})

export const createSectorSchema = sectorFormSchema

export const updateSectorSchema = sectorFormSchema.extend({
  id: z.string().uuid("ID inválido.")
})

export type SectorFormSchema = z.infer<typeof sectorFormSchema>
export type CreateSectorSchema = z.infer<typeof createSectorSchema>
export type UpdateSectorSchema = z.infer<typeof updateSectorSchema>
