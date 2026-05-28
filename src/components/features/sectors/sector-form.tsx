"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createSectorAction,
  updateSectorAction
} from "@/actions/sector-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { Sector } from "@/types/sector"
import {
  sectorFormSchema,
  type SectorFormSchema
} from "@/validations/sectors/sector-schema"

export type SectorFormProps = {
  sector?: Sector
  onSuccess: () => void
  onCancel: () => void
}

export function SectorForm({ sector, onSuccess, onCancel }: SectorFormProps) {
  const isEditing = Boolean(sector)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SectorFormSchema>({
    resolver: zodResolver(sectorFormSchema),
    defaultValues: {
      name: sector?.name ?? ""
    }
  })

  useEffect(() => {
    reset({ name: sector?.name ?? "" })
  }, [sector, reset])

  async function onSubmit(data: SectorFormSchema) {
    try {
      const result = isEditing
        ? await updateSectorAction({ id: sector!.id, name: data.name })
        : await createSectorAction(data)

      if (
        toastFromActionResponse(result, { successFallback: "Setor salvo." })
      ) {
        onSuccess()
      }
    } catch (error) {
      console.error("[SectorForm.onSubmit]", error)
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
        label="Nome do setor"
        placeholder="Ex.: Fundição"
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
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
          {isEditing ? "Salvar alterações" : "Criar setor"}
        </Button>
      </div>
    </form>
  )
}
