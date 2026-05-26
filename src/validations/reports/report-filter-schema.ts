import { z } from "zod"

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")

const optionalUuidSchema = z.union([
  z.literal(""),
  z.string().uuid("Identificador inválido.")
])

export const reportFilterSchema = z
  .object({
    dateFrom: dateSchema,
    dateTo: dateSchema,
    shiftId: optionalUuidSchema,
    sectorId: optionalUuidSchema
  })
  .refine((data) => data.dateFrom <= data.dateTo, {
    message: "A data inicial deve ser anterior ou igual à data final.",
    path: ["dateTo"]
  })

export type ReportFilterSchema = z.infer<typeof reportFilterSchema>

export function parseReportFilters(
  input: Partial<ReportFilterSchema>
): ReportFilterSchema {
  return reportFilterSchema.parse({
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    shiftId: input.shiftId ?? "",
    sectorId: input.sectorId ?? ""
  })
}
