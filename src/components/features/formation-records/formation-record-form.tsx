"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createFormationRecordAction,
  updateFormationRecordAction
} from "@/actions/formation-record-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { isoToDatetimeLocal } from "@/lib/utils/datetime"
import type { EmployeeWithSector } from "@/types/employee"
import type { FormationRecordWithRelations } from "@/types/formation-record"
import {
  formationRecordFormSchema,
  type FormationRecordFormInput,
  type FormationRecordFormSchema
} from "@/validations/formation-records/formation-schema"

import { FormationDetailsEditor } from "./formation-details-editor"
import { FORMATION_STATUS_OPTIONS } from "./formation-record-status-badge"

function mapRecordToLines(
  record?: FormationRecordWithRelations
): FormationRecordFormInput["lines"] {
  if (!record?.details.length) {
    return [
      {
        circuit_number: "" as unknown as number,
        battery_lot_code: "",
        initial_voltage: "" as unknown as number,
        final_voltage: null,
        current_ampere: "" as unknown as number
      }
    ]
  }

  return record.details.map((detail) => ({
    circuit_number: detail.circuit_number,
    battery_lot_code: detail.battery_lot_code,
    initial_voltage: detail.initial_voltage,
    final_voltage: detail.final_voltage,
    current_ampere: detail.current_ampere
  }))
}

export type FormationRecordFormProps = {
  record?: FormationRecordWithRelations
  employees: EmployeeWithSector[]
  batteryLotCodes: string[]
  onSuccess: () => void
  onCancel: () => void
}

export function FormationRecordForm({
  record,
  employees,
  batteryLotCodes,
  onSuccess,
  onCancel
}: FormationRecordFormProps) {
  const isEditing = Boolean(record)

  const operatorOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: employee.name
      })),
    [employees]
  )

  const batteryLotOptions = useMemo(
    () =>
      batteryLotCodes.map((code) => ({
        value: code,
        label: code
      })),
    [batteryLotCodes]
  )

  const defaultValues = useMemo<FormationRecordFormInput>(
    () => ({
      start_date: record?.start_date
        ? isoToDatetimeLocal(record.start_date)
        : isoToDatetimeLocal(new Date().toISOString()),
      end_date: record?.end_date ? isoToDatetimeLocal(record.end_date) : "",
      operator_id: record?.operator_id ?? "",
      status:
        (record?.status as FormationRecordFormInput["status"]) ?? "IN_PROGRESS",
      lines: mapRecordToLines(record)
    }),
    [record]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm<FormationRecordFormInput, unknown, FormationRecordFormSchema>({
    resolver: zodResolver(formationRecordFormSchema),
    defaultValues
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  async function onSubmit(data: FormationRecordFormSchema) {
    try {
      const payload = {
        start_date: data.start_date,
        end_date: data.end_date,
        operator_id: data.operator_id,
        status: data.status,
        lines: data.lines
      }

      const result = isEditing
        ? await updateFormationRecordAction({ id: record!.id, ...payload })
        : await createFormationRecordAction(payload)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar formação.")
        return
      }

      toast.success(result.message ?? "Formação salva com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[FormationRecordForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const hasMasterData = employees.length > 0 && batteryLotCodes.length > 0

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1"
      noValidate
    >
      {isEditing && record ? (
        <Input
          label="Lote de formação"
          type="text"
          readOnly
          disabled
          value={record.formation_lot_code}
          className="tabular-nums"
        />
      ) : null}

      <div className="rounded-ios-card border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cabeçalho
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Início"
            type="datetime-local"
            disabled={isSubmitting}
            error={errors.start_date?.message}
            className="tabular-nums"
            {...register("start_date")}
          />

          <Input
            label="Fim"
            type="datetime-local"
            disabled={isSubmitting}
            error={errors.end_date?.message}
            hint="Obrigatório quando status for Concluída."
            className="tabular-nums"
            {...register("end_date")}
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

          <Select
            label="Status"
            options={FORMATION_STATUS_OPTIONS}
            disabled={isSubmitting}
            error={errors.status?.message}
            {...register("status")}
          />
        </div>
      </div>

      <FormationDetailsEditor
        control={control}
        errors={errors.lines}
        batteryLotOptions={batteryLotOptions}
        disabled={isSubmitting}
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
          {isEditing ? "Salvar alterações" : "Registrar formação"}
        </Button>
      </div>
    </form>
  )
}
