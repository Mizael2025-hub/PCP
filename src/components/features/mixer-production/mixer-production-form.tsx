"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createMixerAction,
  updateMixerAction
} from "@/actions/mixer-production-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { enqueueOutbox } from "@/lib/offline/outbox"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { EmployeeWithSector } from "@/types/employee"
import type { MixerProductionWithRelations } from "@/types/mixer-production"
import type { Shift } from "@/types/shift"
import {
  mixerFormSchema,
  type MixerFormSchema
} from "@/validations/mixer-production/production-schema"

export type MixerProductionFormProps = {
  record?: MixerProductionWithRelations
  shifts: Shift[]
  employees: EmployeeWithSector[]
  onSuccess: () => void
  onCancel: () => void
}

export function MixerProductionForm({
  record,
  shifts,
  employees,
  onSuccess,
  onCancel
}: MixerProductionFormProps) {
  const isEditing = Boolean(record)
  const today = format(new Date(), "yyyy-MM-dd")

  const shiftOptions = useMemo(
    () =>
      shifts.map((shift) => ({
        value: shift.id,
        label: shift.name
      })),
    [shifts]
  )

  const operatorOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: employee.name
      })),
    [employees]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MixerFormSchema>({
    resolver: zodResolver(mixerFormSchema),
    defaultValues: {
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      operator_id: record?.operator_id ?? "",
      batch_number: record?.batch_number ?? "",
      lead_ball_weight: record?.lead_ball_weight ?? ("" as unknown as number),
      oxide_weight: record?.oxide_weight ?? ("" as unknown as number),
      water_volume: record?.water_volume ?? ("" as unknown as number),
      acid_volume: record?.acid_volume ?? ("" as unknown as number),
      density: record?.density ?? ("" as unknown as number)
    }
  })

  useEffect(() => {
    reset({
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      operator_id: record?.operator_id ?? "",
      batch_number: record?.batch_number ?? "",
      lead_ball_weight: record?.lead_ball_weight ?? ("" as unknown as number),
      oxide_weight: record?.oxide_weight ?? ("" as unknown as number),
      water_volume: record?.water_volume ?? ("" as unknown as number),
      acid_volume: record?.acid_volume ?? ("" as unknown as number),
      density: record?.density ?? ("" as unknown as number)
    })
  }, [record, reset, today])

  async function onSubmit(data: MixerFormSchema) {
    try {
      const payload = {
        date: data.date,
        shift_id: data.shift_id,
        operator_id: data.operator_id,
        batch_number: data.batch_number,
        lead_ball_weight: data.lead_ball_weight,
        oxide_weight: data.oxide_weight,
        water_volume: data.water_volume,
        acid_volume: data.acid_volume,
        density: data.density
      }

      if (!navigator.onLine) {
        if (isEditing) {
          await enqueueOutbox("mixer_update", {
            id: record!.id,
            updated_at: record!.updated_at,
            ...payload
          })
        } else {
          await enqueueOutbox("mixer_create", payload)
        }

        toast.success(
          "Salvo no dispositivo. Enviaremos quando a internet voltar."
        )
        onSuccess()
        return
      }

      const result = isEditing
        ? await updateMixerAction({
            id: record!.id,
            updated_at: record!.updated_at,
            ...payload
          })
        : await createMixerAction(payload)

      if (
        toastFromActionResponse(result, {
          successFallback: "Apontamento salvo com sucesso.",
          errorFallback: "Erro ao salvar apontamento."
        })
      ) {
        onSuccess()
      }
    } catch (error) {
      console.error("[MixerProductionForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const hasMasterData = shifts.length > 0 && employees.length > 0

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Data"
        type="date"
        disabled={isSubmitting}
        error={errors.date?.message}
        className="tabular-nums"
        {...register("date")}
      />

      <Select
        label="Turno"
        placeholder="Selecione o turno"
        options={shiftOptions}
        disabled={isSubmitting || shifts.length === 0}
        error={
          errors.shift_id?.message ??
          (shifts.length === 0
            ? "Cadastre turnos em Configurações."
            : undefined)
        }
        {...register("shift_id")}
      />

      <Select
        label="Operador"
        placeholder="Selecione o operador"
        options={operatorOptions}
        disabled={isSubmitting || employees.length === 0}
        error={
          errors.operator_id?.message ??
          (employees.length === 0
            ? "Cadastre funcionários em Configurações."
            : undefined)
        }
        {...register("operator_id")}
      />

      <Input
        label="Nº da batelada"
        type="text"
        placeholder="Ex.: M-2026-001"
        disabled={isSubmitting}
        error={errors.batch_number?.message}
        {...register("batch_number")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Peso bola de chumbo (kg)"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          placeholder="0,000"
          disabled={isSubmitting}
          error={errors.lead_ball_weight?.message}
          className="tabular-nums"
          {...register("lead_ball_weight")}
        />

        <Input
          label="Peso de óxido (kg)"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          placeholder="0,000"
          disabled={isSubmitting}
          error={errors.oxide_weight?.message}
          className="tabular-nums"
          {...register("oxide_weight")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Volume de água (L)"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0,00"
          disabled={isSubmitting}
          error={errors.water_volume?.message}
          className="tabular-nums"
          {...register("water_volume")}
        />

        <Input
          label="Volume de ácido (L)"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0,00"
          disabled={isSubmitting}
          error={errors.acid_volume?.message}
          className="tabular-nums"
          {...register("acid_volume")}
        />
      </div>

      <Input
        label="Densidade (g/cm³)"
        type="number"
        step="0.001"
        min="0"
        inputMode="decimal"
        placeholder="0,000"
        disabled={isSubmitting}
        error={errors.density?.message}
        className="tabular-nums"
        {...register("density")}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={!hasMasterData}
        >
          {isEditing ? "Salvar alterações" : "Registrar produção"}
        </Button>
      </div>
    </form>
  )
}
