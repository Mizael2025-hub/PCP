import { z } from "zod"

const uuidSchema = (label: string) =>
  z
    .string({ required_error: `${label} é obrigatório.` })
    .uuid(`Selecione um(a) ${label.toLowerCase()} válido(a).`)

export const lotCharacteristicEntrySchema = z.object({
  key: z
    .string()
    .min(1, "Informe o nome da característica.")
    .max(80, "Nome da característica muito longo."),
  value: z
    .string()
    .min(1, "Informe o valor da característica.")
    .max(200, "Valor da característica muito longo.")
})

export const lotCharacteristicsFormSchema = z
  .array(lotCharacteristicEntrySchema)
  .superRefine((entries, ctx) => {
    const keys = new Set<string>()

    entries.forEach((entry, index) => {
      const normalizedKey = entry.key.trim().toLowerCase()

      if (!normalizedKey) {
        return
      }

      if (keys.has(normalizedKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Características duplicadas não são permitidas.",
          path: [index, "key"]
        })
        return
      }

      keys.add(normalizedKey)
    })
  })

const assemblyBaseSchema = z.object({
  date: z
    .string({ required_error: "Data é obrigatória." })
    .min(1, "Data é obrigatória."),
  shift_id: uuidSchema("Turno"),
  machine_id: uuidSchema("Máquina"),
  operator_id: uuidSchema("Operador"),
  pasting_production_id: uuidSchema("EP Code de origem"),
  produced_qty: z.coerce
    .number({ invalid_type_error: "Informe uma quantidade válida." })
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade produzida deve ser maior que zero."),
  characteristics: lotCharacteristicsFormSchema
})

export const assemblyFormSchema = assemblyBaseSchema.extend({
  sector_id: uuidSchema("Setor")
})

export const createAssemblySchema = assemblyBaseSchema

export const updateAssemblySchema = assemblyBaseSchema.and(
  z.object({
    id: z.string().uuid("ID inválido.")
  })
)

export const assemblyListFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  shiftId: z.string().uuid("Turno inválido.").optional().or(z.literal("")),
  batteryLotCode: z.string().max(100).optional().or(z.literal("")),
  epCode: z.string().max(100).optional().or(z.literal(""))
})

export type AssemblyFormSchema = z.infer<typeof assemblyFormSchema>
export type CreateAssemblySchema = z.infer<typeof createAssemblySchema>
export type UpdateAssemblySchema = z.infer<typeof updateAssemblySchema>
export type AssemblyListFiltersSchema = z.infer<
  typeof assemblyListFiltersSchema
>
