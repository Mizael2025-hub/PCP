"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createLeadAlloyAction,
  updateLeadAlloyAction
} from "@/actions/lead-alloy-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { LeadAlloy } from "@/types/lead-alloy"
import {
  leadAlloyFormSchema,
  type LeadAlloyFormInput,
  type LeadAlloyFormSchema
} from "@/validations/lead-alloys/lead-alloy-schema"

export type LeadAlloyFormProps = {
  leadAlloy?: LeadAlloy
  onSuccess: () => void
  onCancel: () => void
}

export function LeadAlloyForm({
  leadAlloy,
  onSuccess,
  onCancel
}: LeadAlloyFormProps) {
  const isEditing = Boolean(leadAlloy)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<LeadAlloyFormInput, unknown, LeadAlloyFormSchema>({
    resolver: zodResolver(leadAlloyFormSchema),
    defaultValues: {
      code: leadAlloy?.code ?? "",
      description: leadAlloy?.description ?? ""
    }
  })

  useEffect(() => {
    reset({
      code: leadAlloy?.code ?? "",
      description: leadAlloy?.description ?? ""
    })
  }, [leadAlloy, reset])

  async function onSubmit(data: LeadAlloyFormSchema) {
    try {
      const result = isEditing
        ? await updateLeadAlloyAction({
            id: leadAlloy!.id,
            updated_at: leadAlloy!.updated_at,
            code: data.code,
            description: data.description
          })
        : await createLeadAlloyAction(data)

      if (toastFromActionResponse(result, { successFallback: "Liga salva." })) {
        onSuccess()
      }
    } catch (error) {
      console.error("[LeadAlloyForm.onSubmit]", error)
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
        placeholder="Ex.: LIGA_CA_CA"
        disabled={isSubmitting}
        error={errors.code?.message}
        {...register("code")}
      />

      <Input
        label="Descrição"
        placeholder="Ex.: Liga cálcio-cálcio para grades"
        disabled={isSubmitting}
        error={errors.description?.message}
        hint="Opcional. Até 2000 caracteres."
        {...register("description")}
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
          {isEditing ? "Salvar alterações" : "Criar liga"}
        </Button>
      </div>
    </form>
  )
}
