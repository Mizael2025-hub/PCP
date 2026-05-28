import { z } from "zod"

import { FORMATION_STATUSES } from "@/types/formation-record"

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

const optionalDatetimeSchema = z
  .union([z.literal(""), z.literal(null), z.string().min(1)])
  .optional()
  .transform((value) =>
    value === "" || value === null ? null : (value ?? null)
  )

export const formationDetailLineSchema = z.object({
  circuit_number: z.coerce
    .number({ invalid_type_error: "Informe o circuito." })
    .int("O circuito deve ser inteiro.")
    .positive("O circuito deve ser maior que zero.")
    .max(9999, "Número de circuito fora do limite."),
  battery_lot_code: z
    .string({ required_error: "Lote da bateria é obrigatório." })
    .min(1, "Selecione o lote da bateria.")
    .max(100, "Lote da bateria muito longo."),
  initial_voltage: z.coerce
    .number({ invalid_type_error: "Informe a tensão inicial." })
    .positive("A tensão inicial deve ser maior que zero.")
    .max(99.99, "Tensão inicial fora do limite."),
  final_voltage: nullableNumericField("Tensão final", 0, 99.99),
  current_ampere: z.coerce
    .number({ invalid_type_error: "Informe a corrente." })
    .positive("A corrente deve ser maior que zero.")
    .max(999.99, "Corrente fora do limite.")
})

export const formationLinesSchema = z
  .array(formationDetailLineSchema)
  .min(1, "Adicione ao menos uma linha de formação.")
  .superRefine((lines, ctx) => {
    const circuits = new Set<number>()
    const lots = new Set<string>()

    lines.forEach((line, index) => {
      if (circuits.has(line.circuit_number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Circuito duplicado na mesma formação.",
          path: [index, "circuit_number"]
        })
      } else {
        circuits.add(line.circuit_number)
      }

      const lotKey = line.battery_lot_code.trim().toUpperCase()

      if (lots.has(lotKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lote de bateria duplicado na mesma formação.",
          path: [index, "battery_lot_code"]
        })
      } else {
        lots.add(lotKey)
      }
    })
  })

const formationMasterSchema = z
  .object({
    start_date: z
      .string({ required_error: "Data/hora de início é obrigatória." })
      .min(1, "Data/hora de início é obrigatória."),
    end_date: optionalDatetimeSchema,
    operator_id: uuidSchema("Operador"),
    status: z.enum(FORMATION_STATUSES, {
      required_error: "Status é obrigatório.",
      invalid_type_error: "Status inválido."
    }),
    lines: formationLinesSchema
  })
  .superRefine((data, ctx) => {
    if (data.status === "COMPLETED" && !data.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a data/hora de fim para formações concluídas.",
        path: ["end_date"]
      })
    }

    if (data.end_date && data.start_date) {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)

      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end < start
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A data/hora de fim deve ser posterior ao início.",
          path: ["end_date"]
        })
      }
    }
  })

export const formationRecordFormSchema = formationMasterSchema

export const createFormationRecordSchema = formationMasterSchema

export const updateFormationRecordSchema = formationMasterSchema.and(
  z.object({
    id: z.string().uuid("ID inválido."),
    updated_at: z
      .string()
      .min(1, "Registro desatualizado. Recarregue a página.")
  })
)

export const formationListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(FORMATION_STATUSES).optional().or(z.literal("")),
  operatorId: z.string().uuid("Operador inválido.").optional().or(z.literal(""))
})

export type FormationDetailLineSchema = z.output<
  typeof formationDetailLineSchema
>
export type FormationRecordFormInput = z.input<typeof formationRecordFormSchema>
export type FormationRecordFormSchema = z.output<
  typeof formationRecordFormSchema
>
export type CreateFormationRecordSchema = z.output<
  typeof createFormationRecordSchema
>
export type UpdateFormationRecordSchema = z.output<
  typeof updateFormationRecordSchema
>
