import { z } from "zod"

export const employeeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório.")
    .max(255, "Nome deve ter no máximo 255 caracteres.")
    .trim(),
  registration_code: z
    .string()
    .min(1, "Matrícula é obrigatória.")
    .max(50, "Matrícula deve ter no máximo 50 caracteres.")
    .trim(),
  sector_id: z
    .string({ required_error: "Setor é obrigatório." })
    .uuid("Selecione um setor válido.")
})

export const createEmployeeSchema = employeeFormSchema

export const updateEmployeeSchema = employeeFormSchema.extend({
  id: z.string().uuid("ID inválido.")
})

export type EmployeeFormSchema = z.infer<typeof employeeFormSchema>
export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeSchema = z.infer<typeof updateEmployeeSchema>
