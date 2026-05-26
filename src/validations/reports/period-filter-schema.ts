import { z } from "zod"

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")

export const periodFilterSchema = z
  .object({
    dateFrom: dateSchema,
    dateTo: dateSchema
  })
  .refine((data) => data.dateFrom <= data.dateTo, {
    message: "A data inicial deve ser anterior ou igual à data final.",
    path: ["dateTo"]
  })

export type PeriodFilterSchema = z.infer<typeof periodFilterSchema>

export function parsePeriodFilters(
  input: Partial<PeriodFilterSchema>
): PeriodFilterSchema {
  return periodFilterSchema.parse({
    dateFrom: input.dateFrom,
    dateTo: input.dateTo
  })
}
