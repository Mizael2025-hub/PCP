"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createShiftAction, updateShiftAction } from "@/actions/shift-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import { formatTimeDisplay } from "@/lib/utils/time"
import type { Shift } from "@/types/shift"
import {
  shiftFormSchema,
  type ShiftFormSchema
} from "@/validations/shifts/shift-schema"

export type ShiftFormProps = {
  shift?: Shift
  onSuccess: () => void
  onCancel: () => void
}

function getDefaultValues(shift?: Shift): ShiftFormSchema {
  return {
    name: shift?.name ?? "",
    start_time: shift ? formatTimeDisplay(shift.start_time) : "",
    end_time: shift ? formatTimeDisplay(shift.end_time) : ""
  }
}

export function ShiftForm({ shift, onSuccess, onCancel }: ShiftFormProps) {
  const isEditing = Boolean(shift)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ShiftFormSchema>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: getDefaultValues(shift)
  })

  useEffect(() => {
    reset(getDefaultValues(shift))
  }, [shift, reset])

  async function onSubmit(data: ShiftFormSchema) {
    try {
      const result = isEditing
        ? await updateShiftAction({
            id: shift!.id,
            updated_at: shift!.updated_at,
            ...data
          })
        : await createShiftAction(data)

      if (
        toastFromActionResponse(result, { successFallback: "Turno salvo." })
      ) {
        onSuccess()
      }
    } catch (error) {
      console.error("[ShiftForm.onSubmit]", error)
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
        label="Nome do turno"
        placeholder="Ex.: Turno A"
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          type="time"
          label="Início"
          disabled={isSubmitting}
          error={errors.start_time?.message}
          {...register("start_time")}
        />
        <Input
          type="time"
          label="Fim"
          disabled={isSubmitting}
          error={errors.end_time?.message}
          {...register("end_time")}
        />
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
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Salvar alterações" : "Criar turno"}
        </Button>
      </div>
    </form>
  )
}
