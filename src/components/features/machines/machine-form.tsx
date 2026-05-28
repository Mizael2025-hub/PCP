"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createMachineAction,
  updateMachineAction
} from "@/actions/machine-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { MachineWithSector } from "@/types/machine"
import type { Sector } from "@/types/sector"
import {
  machineFormSchema,
  type MachineFormSchema
} from "@/validations/machines/machine-schema"

export type MachineFormProps = {
  machine?: MachineWithSector
  sectors: Sector[]
  onSuccess: () => void
  onCancel: () => void
}

export function MachineForm({
  machine,
  sectors,
  onSuccess,
  onCancel
}: MachineFormProps) {
  const isEditing = Boolean(machine)

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
  } = useForm<MachineFormSchema>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      name: machine?.name ?? "",
      sector_id: machine?.sector_id ?? ""
    }
  })

  useEffect(() => {
    reset({
      name: machine?.name ?? "",
      sector_id: machine?.sector_id ?? ""
    })
  }, [machine, reset])

  async function onSubmit(data: MachineFormSchema) {
    try {
      const result = isEditing
        ? await updateMachineAction({
            id: machine!.id,
            name: data.name,
            sector_id: data.sector_id
          })
        : await createMachineAction(data)

      if (
        toastFromActionResponse(result, {
          successFallback: "Máquina salva com sucesso.",
          errorFallback: "Erro ao salvar máquina."
        })
      ) {
        onSuccess()
      }
    } catch (error) {
      console.error("[MachineForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const noSectors = sectors.length === 0

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Nome"
        placeholder="Ex.: Fundidora 01"
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
      />

      <Select
        label="Setor"
        placeholder="Selecione o setor"
        options={sectorOptions}
        disabled={isSubmitting || noSectors}
        error={
          errors.sector_id?.message ??
          (noSectors ? "Cadastre um setor antes de criar máquinas." : undefined)
        }
        {...register("sector_id")}
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
        <Button type="submit" isLoading={isSubmitting} disabled={noSectors}>
          {isEditing ? "Salvar alterações" : "Criar máquina"}
        </Button>
      </div>
    </form>
  )
}
