"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createBatteryModelAction,
  updateBatteryModelAction
} from "@/actions/battery-model-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { BatteryModel } from "@/types/battery-model"
import {
  batteryModelFormSchema,
  type BatteryModelFormInput,
  type BatteryModelFormSchema
} from "@/validations/battery-models/battery-model-schema"

export type BatteryModelFormProps = {
  batteryModel?: BatteryModel
  onSuccess: () => void
  onCancel: () => void
}

function formatWeightForInput(weight: number): string {
  return weight.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
    useGrouping: false
  })
}

export function BatteryModelForm({
  batteryModel,
  onSuccess,
  onCancel
}: BatteryModelFormProps) {
  const isEditing = Boolean(batteryModel)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<BatteryModelFormInput, unknown, BatteryModelFormSchema>({
    resolver: zodResolver(batteryModelFormSchema),
    defaultValues: {
      code: batteryModel?.code ?? "",
      name: batteryModel?.name ?? "",
      weight_specification: batteryModel
        ? formatWeightForInput(batteryModel.weight_specification)
        : ""
    }
  })

  useEffect(() => {
    reset({
      code: batteryModel?.code ?? "",
      name: batteryModel?.name ?? "",
      weight_specification: batteryModel
        ? formatWeightForInput(batteryModel.weight_specification)
        : ""
    })
  }, [batteryModel, reset])

  async function onSubmit(data: BatteryModelFormSchema) {
    try {
      const result = isEditing
        ? await updateBatteryModelAction({
            id: batteryModel!.id,
            updated_at: batteryModel!.updated_at,
            code: data.code,
            name: data.name,
            weight_specification: data.weight_specification
          })
        : await createBatteryModelAction(data)

      if (
        toastFromActionResponse(result, {
          successFallback: "Modelo de bateria salvo com sucesso.",
          errorFallback: "Erro ao salvar modelo de bateria."
        })
      ) {
        onSuccess()
      }
    } catch (error) {
      console.error("[BatteryModelForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Código"
        placeholder="Ex.: MBS12V5AH"
        disabled={isSubmitting}
        error={errors.code?.message}
        {...register("code")}
      />

      <Input
        label="Nome"
        placeholder="Ex.: Bateria 12V 5Ah"
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Peso nominal (kg)"
        type="text"
        inputMode="decimal"
        placeholder="Ex.: 1,850"
        disabled={isSubmitting}
        error={errors.weight_specification?.message}
        hint="Informe o peso em quilogramas com até 3 casas decimais."
        className="tabular-nums"
        {...register("weight_specification")}
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
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Salvar alterações" : "Criar modelo"}
        </Button>
      </div>
    </form>
  )
}
