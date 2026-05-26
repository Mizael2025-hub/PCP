"use client"

import { Plus, Trash2 } from "lucide-react"
import { useFieldArray, type Control, type FieldErrors } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AssemblyFormSchema } from "@/validations/assembly-production/production-schema"

export type LotCharacteristicsEditorProps = {
  control: Control<AssemblyFormSchema>
  errors?: FieldErrors<AssemblyFormSchema>["characteristics"]
  disabled?: boolean
}

export function LotCharacteristicsEditor({
  control,
  errors,
  disabled = false
}: LotCharacteristicsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "characteristics"
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Características do lote
          </p>
          <p className="text-xs text-zinc-500">
            Campos dinâmicos gravados em JSON (ex.: terminal, selo, observação).
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          disabled={disabled}
          onClick={() => append({ key: "", value: "" })}
        >
          Adicionar
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-ios-btn border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          Nenhuma característica adicional. Clique em Adicionar para incluir
          pares chave/valor.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {fields.map((field, index) => {
            const rowError = Array.isArray(errors) ? errors[index] : undefined

            return (
              <li
                key={field.id}
                className="grid gap-2 rounded-ios-btn border border-zinc-200 p-3 dark:border-zinc-800 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  label={index === 0 ? "Chave" : undefined}
                  placeholder="Ex.: terminal"
                  disabled={disabled}
                  error={rowError?.key?.message}
                  {...control.register(`characteristics.${index}.key` as const)}
                />
                <Input
                  label={index === 0 ? "Valor" : undefined}
                  placeholder="Ex.: superior"
                  disabled={disabled}
                  error={rowError?.value?.message}
                  className="tabular-nums"
                  {...control.register(
                    `characteristics.${index}.value` as const
                  )}
                />
                <div className="flex items-end justify-end sm:items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Remover característica"
                    disabled={disabled}
                    onClick={() => remove(index)}
                    icon={Trash2}
                  >
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {typeof errors === "object" &&
      errors !== null &&
      !Array.isArray(errors) &&
      "message" in errors &&
      typeof errors.message === "string" ? (
        <span className="text-[12px] text-apple-red">{errors.message}</span>
      ) : null}
    </div>
  )
}
