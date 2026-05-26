"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createLeadConsumptionAction,
  updateLeadConsumptionAction
} from "@/actions/lead-consumption-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { LeadAlloy } from "@/types/lead-alloy"
import type { LeadConsumptionWithRelations } from "@/types/lead-consumption"
import type { Sector } from "@/types/sector"
import {
  leadConsumptionFormSchema,
  type LeadConsumptionFormSchema
} from "@/validations/lead-consumption/consumption-schema"

export type LeadConsumptionFormProps = {
  record?: LeadConsumptionWithRelations
  alloys: LeadAlloy[]
  sectors: Sector[]
  onSuccess: () => void
  onCancel: () => void
}

function formatAlloyLabel(alloy: LeadAlloy): string {
  return alloy.description ? `${alloy.code} — ${alloy.description}` : alloy.code
}

export function LeadConsumptionForm({
  record,
  alloys,
  sectors,
  onSuccess,
  onCancel
}: LeadConsumptionFormProps) {
  const isEditing = Boolean(record)
  const today = format(new Date(), "yyyy-MM-dd")

  const alloyOptions = useMemo(
    () =>
      alloys.map((alloy) => ({
        value: alloy.id,
        label: formatAlloyLabel(alloy)
      })),
    [alloys]
  )

  const sectorOptions = useMemo(
    () =>
      sectors.map((sector) => ({
        value: sector.id,
        label: sector.name
      })),
    [sectors]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<LeadConsumptionFormSchema>({
    resolver: zodResolver(leadConsumptionFormSchema),
    defaultValues: {
      date: record?.date ?? today,
      alloy_id: record?.alloy_id ?? "",
      destination_sector_id: record?.destination_sector_id ?? "",
      weight_consumed: record?.weight_consumed ?? ("" as unknown as number)
    }
  })

  useEffect(() => {
    reset({
      date: record?.date ?? today,
      alloy_id: record?.alloy_id ?? "",
      destination_sector_id: record?.destination_sector_id ?? "",
      weight_consumed: record?.weight_consumed ?? ("" as unknown as number)
    })
  }, [record, reset, today])

  async function onSubmit(data: LeadConsumptionFormSchema) {
    try {
      const payload = {
        date: data.date,
        alloy_id: data.alloy_id,
        destination_sector_id: data.destination_sector_id,
        weight_consumed: data.weight_consumed
      }

      const result = isEditing
        ? await updateLeadConsumptionAction({ id: record!.id, ...payload })
        : await createLeadConsumptionAction(payload)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar apontamento.")
        return
      }

      toast.success(result.message ?? "Apontamento salvo com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[LeadConsumptionForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const hasMasterData = alloys.length > 0 && sectors.length > 0

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
        label="Liga de chumbo"
        placeholder="Selecione a liga"
        options={alloyOptions}
        disabled={isSubmitting || alloys.length === 0}
        error={
          errors.alloy_id?.message ??
          (alloys.length === 0 ? "Cadastre ligas em Configurações." : undefined)
        }
        {...register("alloy_id")}
      />

      <Select
        label="Setor de destino"
        placeholder="Selecione o setor"
        options={sectorOptions}
        disabled={isSubmitting || sectors.length === 0}
        error={
          errors.destination_sector_id?.message ??
          (sectors.length === 0
            ? "Cadastre setores em Configurações."
            : undefined)
        }
        {...register("destination_sector_id")}
      />

      <Input
        label="Peso consumido (kg)"
        type="number"
        step="0.001"
        min="0"
        inputMode="decimal"
        placeholder="0,000"
        disabled={isSubmitting}
        error={errors.weight_consumed?.message}
        className="tabular-nums"
        {...register("weight_consumed")}
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
          {isEditing ? "Salvar alterações" : "Registrar consumo"}
        </Button>
      </div>
    </form>
  )
}
