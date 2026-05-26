import { z } from "zod"

export const machineFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório.")
    .max(100, "Nome deve ter no máximo 100 caracteres.")
    .trim(),
  sector_id: z
    .string({ required_error: "Setor é obrigatório." })
    .uuid("Selecione um setor válido.")
})

export const createMachineSchema = machineFormSchema

export const updateMachineSchema = machineFormSchema.extend({
  id: z.string().uuid("ID inválido.")
})

export type MachineFormSchema = z.infer<typeof machineFormSchema>
export type CreateMachineSchema = z.infer<typeof createMachineSchema>
export type UpdateMachineSchema = z.infer<typeof updateMachineSchema>
