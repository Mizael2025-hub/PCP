import { isEqual } from "date-fns"
import { z } from "zod"

import {
  isValidTimeValue,
  normalizeTimeForDb,
  parseTimeValue
} from "@/lib/utils/time"

const timeFieldSchema = z
  .string()
  .min(1, "Horário é obrigatório.")
  .refine(isValidTimeValue, "Horário inválido. Use o formato HH:mm.")
  .transform(normalizeTimeForDb)

export const shiftFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório.")
      .max(50, "Nome deve ter no máximo 50 caracteres.")
      .trim(),
    start_time: timeFieldSchema,
    end_time: timeFieldSchema
  })
  .refine(
    (data) => {
      const start = parseTimeValue(data.start_time)
      const end = parseTimeValue(data.end_time)

      if (!start || !end) {
        return true
      }

      return !isEqual(start, end)
    },
    {
      message: "Início e fim não podem ser iguais.",
      path: ["end_time"]
    }
  )

export const createShiftSchema = shiftFormSchema

export const updateShiftSchema = shiftFormSchema.and(
  z.object({
    id: z.string().uuid("ID inválido.")
  })
)

export type ShiftFormSchema = z.infer<typeof shiftFormSchema>
export type CreateShiftSchema = z.infer<typeof createShiftSchema>
export type UpdateShiftSchema = z.infer<typeof updateShiftSchema>
