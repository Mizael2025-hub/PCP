"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createSandingScrapAction,
  updateSandingScrapAction
} from "@/actions/sanding-scrap-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { enqueueOutbox } from "@/lib/offline/outbox"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { EmployeeWithSector } from "@/types/employee"
import type { SandingScrapWithRelations } from "@/types/sanding-scrap"
import {
  sandingScrapFormSchema,
  type SandingScrapFormSchema
} from "@/validations/sanding-scrap/scrap-schema"

export type SandingScrapFormProps = {
  record?: SandingScrapWithRelations
  employees: EmployeeWithSector[]
  onSuccess: () => void
  onCancel: () => void
}

export function SandingScrapForm({
  record,
  employees,
  onSuccess,
  onCancel
}: SandingScrapFormProps) {
  const isEditing = Boolean(record)
  const today = format(new Date(), "yyyy-MM-dd")

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
  } = useForm<SandingScrapFormSchema>({
    resolver: zodResolver(sandingScrapFormSchema),
    defaultValues: {
      date: record?.date ?? today,
      operator_id: record?.operator_id ?? "",
      scrap_weight: record?.scrap_weight ?? ("" as unknown as number),
      plates_qty_lost: record?.plates_qty_lost ?? ("" as unknown as number)
    }
  })

  useEffect(() => {
    reset({
      date: record?.date ?? today,
      operator_id: record?.operator_id ?? "",
      scrap_weight: record?.scrap_weight ?? ("" as unknown as number),
      plates_qty_lost: record?.plates_qty_lost ?? ("" as unknown as number)
    })
  }, [record, reset, today])

  async function onSubmit(data: SandingScrapFormSchema) {
    try {
      const payload = {
        date: data.date,
        operator_id: data.operator_id,
        scrap_weight: data.scrap_weight,
        plates_qty_lost: data.plates_qty_lost
      }

      if (!navigator.onLine) {
        if (isEditing) {
          await enqueueOutbox("sanding_scrap_update", {
            id: record!.id,
            updated_at: record!.updated_at,
            ...payload
          })
        } else {
          await enqueueOutbox("sanding_scrap_create", payload)
        }

        toast.success(
          "Salvo no dispositivo. Enviaremos quando a internet voltar."
        )
        onSuccess()
        return
      }

      const result = isEditing
        ? await updateSandingScrapAction({
            id: record!.id,
            updated_at: record!.updated_at,
            ...payload
          })
        : await createSandingScrapAction(payload)

      if (
        toastFromActionResponse(result, {
          successFallback: "Apontamento salvo com sucesso.",
          errorFallback: "Erro ao salvar apontamento."
        })
      ) {
        onSuccess()
      }
    } catch (error) {
      console.error("[SandingScrapForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const hasMasterData = employees.length > 0

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
        label="Peso de refugo (kg)"
        type="number"
        step="0.001"
        min="0"
        inputMode="decimal"
        placeholder="0,000"
        disabled={isSubmitting}
        error={errors.scrap_weight?.message}
        className="tabular-nums"
        {...register("scrap_weight")}
      />

      <Input
        label="Placas perdidas"
        type="number"
        step="1"
        min="1"
        inputMode="numeric"
        placeholder="0"
        disabled={isSubmitting}
        error={errors.plates_qty_lost?.message}
        className="tabular-nums"
        {...register("plates_qty_lost")}
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
          {isEditing ? "Salvar alterações" : "Registrar refugo"}
        </Button>
      </div>
    </form>
  )
}
