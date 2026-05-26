"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createLabQualityControlAction,
  updateLabQualityControlAction
} from "@/actions/lab-quality-control-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { computeMassDensity, formatMassDensity } from "@/lib/utils/mass-density"
import type { MixerProduction } from "@/types/mixer-production"
import type { LabQualityControlWithRelations } from "@/types/lab-quality-control"
import {
  labQualityControlFormSchema,
  type LabQualityControlFormInput,
  type LabQualityControlFormSchema
} from "@/validations/lab-quality-control/quality-schema"

import { LAB_QC_STATUS_OPTIONS } from "./lab-quality-control-status-badge"

function formatSampleLabel(sample: MixerProduction): string {
  const dateLabel = format(parseISO(sample.date), "dd/MM/yyyy", {
    locale: ptBR
  })

  return `Batelada ${sample.batch_number} · ${dateLabel}`
}

export type LabQualityControlFormProps = {
  record?: LabQualityControlWithRelations
  samples: MixerProduction[]
  onSuccess: () => void
  onCancel: () => void
}

export function LabQualityControlForm({
  record,
  samples,
  onSuccess,
  onCancel
}: LabQualityControlFormProps) {
  const isEditing = Boolean(record)
  const today = format(new Date(), "yyyy-MM-dd")

  const sampleOptions = useMemo(
    () =>
      samples.map((sample) => ({
        value: sample.id,
        label: formatSampleLabel(sample)
      })),
    [samples]
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<LabQualityControlFormInput, unknown, LabQualityControlFormSchema>(
    {
      resolver: zodResolver(labQualityControlFormSchema),
      defaultValues: {
        date: record?.date ?? today,
        source_id: record?.source_id ?? "",
        acid_concentration: record?.acid_concentration ?? null,
        temperature: record?.temperature ?? null,
        status:
          (record?.status as LabQualityControlFormSchema["status"]) ??
          "PENDING",
        notes: record?.notes ?? ""
      }
    }
  )

  const acidConcentration = watch("acid_concentration")
  const normalizedAcid =
    acidConcentration === "" ||
    acidConcentration === null ||
    acidConcentration === undefined
      ? null
      : Number(acidConcentration)
  const previewMassDensity = computeMassDensity(
    Number.isNaN(normalizedAcid) ? null : normalizedAcid
  )

  useEffect(() => {
    reset({
      date: record?.date ?? today,
      source_id: record?.source_id ?? "",
      acid_concentration: record?.acid_concentration ?? null,
      temperature: record?.temperature ?? null,
      status:
        (record?.status as LabQualityControlFormSchema["status"]) ?? "PENDING",
      notes: record?.notes ?? ""
    })
  }, [record, reset, today])

  async function onSubmit(data: LabQualityControlFormSchema) {
    try {
      const payload = {
        date: data.date,
        source_id: data.source_id,
        acid_concentration: data.acid_concentration,
        temperature: data.temperature,
        status: data.status,
        notes: data.notes
      }

      const result = isEditing
        ? await updateLabQualityControlAction({ id: record!.id, ...payload })
        : await createLabQualityControlAction(payload)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar análise.")
        return
      }

      toast.success(result.message ?? "Análise salva com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[LabQualityControlForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const hasSamples = samples.length > 0

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
        label="Amostra (misturador)"
        placeholder="Selecione a batelada"
        options={sampleOptions}
        disabled={isSubmitting || !hasSamples}
        error={
          errors.source_id?.message ??
          (!hasSamples
            ? "Cadastre apontamentos no misturador antes de registrar análises."
            : undefined)
        }
        {...register("source_id")}
      />

      <Input
        label="Concentração de ácido (%)"
        type="number"
        step="0.01"
        min="0"
        max="100"
        inputMode="decimal"
        placeholder="Opcional"
        disabled={isSubmitting}
        error={errors.acid_concentration?.message}
        hint="Deixe em branco se ainda não houver resultado."
        className="tabular-nums"
        {...register("acid_concentration")}
      />

      <Input
        label="Densidade (g/cm³)"
        type="text"
        readOnly
        disabled
        value={formatMassDensity(previewMassDensity ?? record?.mass_density)}
        hint="Calculada automaticamente a partir da concentração de ácido."
        className="tabular-nums"
      />

      <Input
        label="Temperatura (°C)"
        type="number"
        step="0.1"
        inputMode="decimal"
        placeholder="Opcional"
        disabled={isSubmitting}
        error={errors.temperature?.message}
        hint="Deixe em branco se ainda não houver medição."
        className="tabular-nums"
        {...register("temperature")}
      />

      <Select
        label="Status"
        options={LAB_QC_STATUS_OPTIONS}
        disabled={isSubmitting}
        error={errors.status?.message}
        {...register("status")}
      />

      <Input
        label="Observações"
        type="text"
        placeholder="Opcional"
        disabled={isSubmitting}
        error={errors.notes?.message}
        {...register("notes")}
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
        <Button type="submit" isLoading={isSubmitting} disabled={!hasSamples}>
          {isEditing ? "Salvar alterações" : "Registrar análise"}
        </Button>
      </div>
    </form>
  )
}
