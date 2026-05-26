"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createLeadBallAction,
  updateLeadBallAction
} from "@/actions/lead-ball-production-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { EmployeeWithSector } from "@/types/employee"
import type { LeadBallProductionWithRelations } from "@/types/lead-ball-production"
import type { Shift } from "@/types/shift"
import {
  leadBallFormSchema,
  type LeadBallFormSchema
} from "@/validations/lead-ball-production/production-schema"

export type LeadBallProductionFormProps = {
  record?: LeadBallProductionWithRelations
  shifts: Shift[]
  employees: EmployeeWithSector[]
  onSuccess: () => void
  onCancel: () => void
}

export function LeadBallProductionForm({
  record,
  shifts,
  employees,
  onSuccess,
  onCancel
}: LeadBallProductionFormProps) {
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
  } = useForm<LeadBallFormSchema>({
    resolver: zodResolver(leadBallFormSchema),
    defaultValues: {
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      operator_id: record?.operator_id ?? "",
      weight_produced: record?.weight_produced ?? ("" as unknown as number),
      silo_number: record?.silo_number ?? ("" as unknown as number)
    }
  })

  useEffect(() => {
    reset({
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      operator_id: record?.operator_id ?? "",
      weight_produced: record?.weight_produced ?? ("" as unknown as number),
      silo_number: record?.silo_number ?? ("" as unknown as number)
    })
  }, [record, reset, today])

  async function onSubmit(data: LeadBallFormSchema) {
    try {
      const payload = {
        date: data.date,
        shift_id: data.shift_id,
        operator_id: data.operator_id,
        weight_produced: data.weight_produced,
        silo_number: data.silo_number
      }

      const result = isEditing
        ? await updateLeadBallAction({ id: record!.id, ...payload })
        : await createLeadBallAction(payload)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar apontamento.")
        return
      }

      toast.success(result.message ?? "Apontamento salvo com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[LeadBallProductionForm.onSubmit]", error)
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nº do silo"
          type="number"
          step="1"
          min="1"
          inputMode="numeric"
          placeholder="1"
          disabled={isSubmitting}
          error={errors.silo_number?.message}
          className="tabular-nums"
          {...register("silo_number")}
        />

        <Input
          label="Peso produzido (kg)"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          placeholder="0,000"
          disabled={isSubmitting}
          error={errors.weight_produced?.message}
          className="tabular-nums"
          {...register("weight_produced")}
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
