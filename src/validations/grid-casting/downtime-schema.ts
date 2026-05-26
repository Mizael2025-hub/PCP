import { differenceInMinutes, isValid } from "date-fns"
import { z } from "zod"

import { datetimeLocalToIso } from "@/lib/utils/datetime"

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

const downtimeFieldsSchema = z.object({
  production_id: uuidSchema("Apontamento"),
  reason: z
    .string({ required_error: "Motivo é obrigatório." })
    .trim()
    .min(1, "Motivo é obrigatório.")
    .max(500, "Motivo deve ter no máximo 500 caracteres."),
  start_time: z
    .string({ required_error: "Início é obrigatório." })
    .min(1, "Início é obrigatório."),
  end_time: z
    .string({ required_error: "Fim é obrigatório." })
    .min(1, "Fim é obrigatório.")
})

const downtimeTimeRefinement = (
  data: z.infer<typeof downtimeFieldsSchema>,
  ctx: z.RefinementCtx
) => {
  const start = new Date(data.start_time)
  const end = new Date(data.end_time)

  if (!isValid(start)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Horário de início inválido.",
      path: ["start_time"]
    })
    return
  }

  if (!isValid(end)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Horário de fim inválido.",
      path: ["end_time"]
    })
    return
  }

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O horário de fim deve ser posterior ao início.",
      path: ["end_time"]
    })
    return
  }

  const duration = differenceInMinutes(end, start)

  if (duration < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A parada deve ter duração mínima de 1 minuto.",
      path: ["end_time"]
    })
  }
}

export const gridCastingDowntimeFormSchema = downtimeFieldsSchema.superRefine(
  downtimeTimeRefinement
)

function toPersistPayload(data: z.infer<typeof downtimeFieldsSchema>) {
  const startIso = datetimeLocalToIso(data.start_time)
  const endIso = datetimeLocalToIso(data.end_time)
  const durationMinutes = differenceInMinutes(
    new Date(endIso),
    new Date(startIso)
  )

  return {
    production_id: data.production_id,
    reason: data.reason.trim(),
    start_time: startIso,
    end_time: endIso,
    duration_minutes: durationMinutes
  }
}

export const createGridCastingDowntimeSchema = downtimeFieldsSchema
  .superRefine(downtimeTimeRefinement)
  .transform(toPersistPayload)

export const updateGridCastingDowntimeSchema = downtimeFieldsSchema
  .extend({
    id: z.string().uuid("ID inválido.")
  })
  .superRefine(downtimeTimeRefinement)
  .transform((data) => ({
    id: data.id,
    ...toPersistPayload(data)
  }))

export const gridCastingDowntimeListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  shiftId: z.string().uuid("Turno inválido.").optional().or(z.literal("")),
  productionId: z
    .string()
    .uuid("Apontamento inválido.")
    .optional()
    .or(z.literal(""))
})

export type GridCastingDowntimeFormSchema = z.infer<
  typeof gridCastingDowntimeFormSchema
>
export type CreateGridCastingDowntimeSchema = z.infer<
  typeof createGridCastingDowntimeSchema
>
export type UpdateGridCastingDowntimeSchema = z.infer<
  typeof updateGridCastingDowntimeSchema
>
