"use client"

import { Plus, Trash2 } from "lucide-react"
import { useFieldArray, type Control, type FieldErrors } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { FormationRecordFormInput } from "@/validations/formation-records/formation-schema"

export type FormationDetailsEditorProps = {
  control: Control<FormationRecordFormInput>
  errors?: FieldErrors<FormationRecordFormInput>["lines"]
  batteryLotOptions: { value: string; label: string }[]
  disabled?: boolean
}

const EMPTY_LINE = {
  circuit_number: "" as unknown as number,
  battery_lot_code: "",
  initial_voltage: "" as unknown as number,
  final_voltage: null as number | null,
  current_ampere: "" as unknown as number
}

export function FormationDetailsEditor({
  control,
  errors,
  batteryLotOptions,
  disabled = false
}: FormationDetailsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines"
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Linhas de formação
          </p>
          <p className="text-xs text-zinc-500">
            Circuitos, lotes de bateria e medições elétricas (linhas
            ilimitadas).
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          disabled={disabled || batteryLotOptions.length === 0}
          onClick={() => append(EMPTY_LINE)}
        >
          Adicionar linha
        </Button>
      </div>

      {batteryLotOptions.length === 0 ? (
        <p className="rounded-ios-btn border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-apple-red dark:border-zinc-700 dark:bg-zinc-900">
          Cadastre montagens com lote de bateria antes de registrar formações.
        </p>
      ) : null}

      {fields.length === 0 ? (
        <p className="rounded-ios-btn border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          Nenhuma linha adicionada. Clique em Adicionar linha para incluir
          circuitos.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const rowError = Array.isArray(errors) ? errors[index] : undefined

            return (
              <li
                key={field.id}
                className="rounded-ios-card border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">
                    Linha {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Remover linha"
                    disabled={disabled}
                    onClick={() => remove(index)}
                    icon={Trash2}
                  >
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Circuito"
                    type="number"
                    step="1"
                    min="1"
                    inputMode="numeric"
                    placeholder="1"
                    disabled={disabled}
                    error={rowError?.circuit_number?.message}
                    className="tabular-nums"
                    {...control.register(
                      `lines.${index}.circuit_number` as const
                    )}
                  />

                  <Select
                    label="Lote da bateria"
                    placeholder="Selecione o lote"
                    options={batteryLotOptions}
                    disabled={disabled}
                    error={rowError?.battery_lot_code?.message}
                    {...control.register(
                      `lines.${index}.battery_lot_code` as const
                    )}
                  />

                  <Input
                    label="Tensão inicial (V)"
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    placeholder="0,00"
                    disabled={disabled}
                    error={rowError?.initial_voltage?.message}
                    className="tabular-nums"
                    {...control.register(
                      `lines.${index}.initial_voltage` as const
                    )}
                  />

                  <Input
                    label="Tensão final (V)"
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    placeholder="Opcional"
                    disabled={disabled}
                    error={rowError?.final_voltage?.message}
                    hint="Deixe em branco se ainda não houver medição."
                    className="tabular-nums"
                    {...control.register(
                      `lines.${index}.final_voltage` as const
                    )}
                  />

                  <Input
                    label="Corrente (A)"
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    placeholder="0,00"
                    disabled={disabled}
                    error={rowError?.current_ampere?.message}
                    className="tabular-nums sm:col-span-2"
                    {...control.register(
                      `lines.${index}.current_ampere` as const
                    )}
                  />
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
