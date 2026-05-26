"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createEmployeeAction,
  updateEmployeeAction
} from "@/actions/employee-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { EmployeeWithSector } from "@/types/employee"
import type { Sector } from "@/types/sector"
import {
  employeeFormSchema,
  type EmployeeFormSchema
} from "@/validations/employees/employee-schema"

export type EmployeeFormProps = {
  employee?: EmployeeWithSector
  sectors: Sector[]
  onSuccess: () => void
  onCancel: () => void
}

export function EmployeeForm({
  employee,
  sectors,
  onSuccess,
  onCancel
}: EmployeeFormProps) {
  const isEditing = Boolean(employee)

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
  } = useForm<EmployeeFormSchema>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employee?.name ?? "",
      registration_code: employee?.registration_code ?? "",
      sector_id: employee?.sector_id ?? ""
    }
  })

  useEffect(() => {
    reset({
      name: employee?.name ?? "",
      registration_code: employee?.registration_code ?? "",
      sector_id: employee?.sector_id ?? ""
    })
  }, [employee, reset])

  async function onSubmit(data: EmployeeFormSchema) {
    try {
      const result = isEditing
        ? await updateEmployeeAction({
            id: employee!.id,
            name: data.name,
            registration_code: data.registration_code,
            sector_id: data.sector_id
          })
        : await createEmployeeAction(data)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar funcionário.")
        return
      }

      toast.success(result.message ?? "Funcionário salvo com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[EmployeeForm.onSubmit]", error)
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
        placeholder="Ex.: João Silva"
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Matrícula"
        placeholder="Ex.: 001234"
        disabled={isSubmitting}
        error={errors.registration_code?.message}
        {...register("registration_code")}
      />

      <Select
        label="Setor"
        placeholder="Selecione o setor"
        options={sectorOptions}
        disabled={isSubmitting || noSectors}
        error={
          errors.sector_id?.message ??
          (noSectors
            ? "Cadastre um setor antes de criar funcionários."
            : undefined)
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
          {isEditing ? "Salvar alterações" : "Criar funcionário"}
        </Button>
      </div>
    </form>
  )
}
