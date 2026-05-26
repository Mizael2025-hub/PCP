"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createGridCastingDowntimeAction,
  updateGridCastingDowntimeAction
} from "@/actions/grid-casting-downtime-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  computeDurationMinutesFromLocal,
  formatDurationLabel,
  isoToDatetimeLocal
} from "@/lib/utils/datetime"
import type { GridCastingProductionWithRelations } from "@/types/grid-casting"
import type { GridCastingDowntimeWithProduction } from "@/types/grid-casting-downtime"
import {
  gridCastingDowntimeFormSchema,
  type GridCastingDowntimeFormSchema
} from "@/validations/grid-casting/downtime-schema"

export type GridCastingDowntimeFormProps = {
  record?: GridCastingDowntimeWithProduction
  productions: GridCastingProductionWithRelations[]
  onSuccess: () => void
  onCancel: () => void
}

function formatProductionLabel(
  production: GridCastingProductionWithRelations
): string {
  const date = production.date.split("-").reverse().join("/")
  const shift = production.shifts?.name ?? "—"
  const machine = production.machines?.name ?? "—"

  return `${date} · ${shift} · ${machine}`
}

export function GridCastingDowntimeForm({
  record,
  productions,
  onSuccess,
  onCancel
}: GridCastingDowntimeFormProps) {
  const isEditing = Boolean(record)

  const productionOptions = useMemo(
    () =>
      productions.map((production) => ({
        value: production.id,
        label: formatProductionLabel(production)
      })),
    [productions]
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<GridCastingDowntimeFormSchema>({
    resolver: zodResolver(gridCastingDowntimeFormSchema),
    defaultValues: {
      production_id: record?.production_id ?? "",
      reason: record?.reason ?? "",
      start_time: record?.start_time
        ? isoToDatetimeLocal(record.start_time)
        : "",
      end_time: record?.end_time ? isoToDatetimeLocal(record.end_time) : ""
    }
  })

  const startTime = watch("start_time")
  const endTime = watch("end_time")

  const computedDuration = useMemo(() => {
    if (!startTime || !endTime) {
      return 0
    }

    return computeDurationMinutesFromLocal(startTime, endTime)
  }, [startTime, endTime])

  useEffect(() => {
    reset({
      production_id: record?.production_id ?? "",
      reason: record?.reason ?? "",
      start_time: record?.start_time
        ? isoToDatetimeLocal(record.start_time)
        : "",
      end_time: record?.end_time ? isoToDatetimeLocal(record.end_time) : ""
    })
  }, [record, reset])

  async function onSubmit(data: GridCastingDowntimeFormSchema) {
    try {
      const result = isEditing
        ? await updateGridCastingDowntimeAction({ id: record!.id, ...data })
        : await createGridCastingDowntimeAction(data)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar parada.")
        return
      }

      toast.success(result.message ?? "Parada salva com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[GridCastingDowntimeForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const canSubmit = productions.length > 0

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <Select
        label="Apontamento de produção"
        placeholder={
          productions.length > 0
            ? "Selecione o apontamento"
            : "Nenhum apontamento no período"
        }
        options={productionOptions}
        disabled={isSubmitting || productions.length === 0}
        error={
          errors.production_id?.message ??
          (productions.length === 0
            ? "Registre apontamentos no período filtrado antes de lançar paradas."
            : undefined)
        }
        {...register("production_id")}
      />

      <Input
        label="Motivo da parada"
        placeholder="Ex.: Manutenção preventiva, troca de molde..."
        disabled={isSubmitting}
        error={errors.reason?.message}
        {...register("reason")}
      />

      <Input
        label="Início"
        type="datetime-local"
        disabled={isSubmitting}
        error={errors.start_time?.message}
        className="tabular-nums"
        {...register("start_time")}
      />

      <Input
        label="Fim"
        type="datetime-local"
        disabled={isSubmitting}
        error={errors.end_time?.message}
        className="tabular-nums"
        {...register("end_time")}
      />

      <div className="rounded-ios-card border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Duração calculada
        </p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {computedDuration > 0 ? formatDurationLabel(computedDuration) : "—"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Atualizada automaticamente com base no início e fim informados.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit}>
          {isEditing ? "Salvar alterações" : "Registrar parada"}
        </Button>
      </div>
    </form>
  )
}
