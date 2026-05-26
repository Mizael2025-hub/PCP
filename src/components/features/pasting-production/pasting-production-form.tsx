"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createPastingAction,
  updatePastingAction
} from "@/actions/pasting-production-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { BatteryModel } from "@/types/battery-model"
import type { EmployeeWithSector } from "@/types/employee"
import type { MachineWithSector } from "@/types/machine"
import type { PastingProductionWithRelations } from "@/types/pasting-production"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"
import {
  pastingFormSchema,
  type PastingFormSchema
} from "@/validations/pasting-production/production-schema"

export type PastingProductionFormProps = {
  record?: PastingProductionWithRelations
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  batteryModels: BatteryModel[]
  onSuccess: () => void
  onCancel: () => void
}

function resolveSectorId(
  record: PastingProductionWithRelations | undefined
): string {
  return record?.machines?.sector_id ?? record?.employees?.sector_id ?? ""
}

export function PastingProductionForm({
  record,
  sectors,
  shifts,
  machines,
  employees,
  batteryModels,
  onSuccess,
  onCancel
}: PastingProductionFormProps) {
  const isEditing = Boolean(record)
  const today = format(new Date(), "yyyy-MM-dd")

  const sectorOptions = useMemo(
    () =>
      sectors.map((sector) => ({
        value: sector.id,
        label: sector.name
      })),
    [sectors]
  )

  const shiftOptions = useMemo(
    () =>
      shifts.map((shift) => ({
        value: shift.id,
        label: shift.name
      })),
    [shifts]
  )

  const batteryModelOptions = useMemo(
    () =>
      batteryModels.map((model) => ({
        value: model.id,
        label: `${model.code} — ${model.name}`
      })),
    [batteryModels]
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PastingFormSchema>({
    resolver: zodResolver(pastingFormSchema),
    defaultValues: {
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      sector_id: resolveSectorId(record),
      machine_id: record?.machine_id ?? "",
      operator_id: record?.operator_id ?? "",
      battery_model_id: record?.battery_model_id ?? "",
      plates_qty: record?.plates_qty ?? ("" as unknown as number)
    }
  })

  const selectedSectorId = watch("sector_id")
  const selectedMachineId = watch("machine_id")
  const selectedOperatorId = watch("operator_id")
  const selectedBatteryModelId = watch("battery_model_id")

  const machineOptions = useMemo(() => {
    if (!selectedSectorId) {
      return []
    }

    return machines
      .filter((machine) => machine.sector_id === selectedSectorId)
      .map((machine) => ({
        value: machine.id,
        label: machine.name
      }))
  }, [machines, selectedSectorId])

  const operatorOptions = useMemo(() => {
    if (!selectedSectorId) {
      return []
    }

    return employees
      .filter((employee) => employee.sector_id === selectedSectorId)
      .map((employee) => ({
        value: employee.id,
        label: employee.name
      }))
  }, [employees, selectedSectorId])

  const selectedBatteryModel = useMemo(
    () =>
      batteryModels.find((model) => model.id === selectedBatteryModelId) ??
      null,
    [batteryModels, selectedBatteryModelId]
  )

  useEffect(() => {
    reset({
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      sector_id: resolveSectorId(record),
      machine_id: record?.machine_id ?? "",
      operator_id: record?.operator_id ?? "",
      battery_model_id: record?.battery_model_id ?? "",
      plates_qty: record?.plates_qty ?? ("" as unknown as number)
    })
  }, [record, reset, today])

  useEffect(() => {
    if (
      selectedMachineId &&
      !machineOptions.some((option) => option.value === selectedMachineId)
    ) {
      setValue("machine_id", "")
    }

    if (
      selectedOperatorId &&
      !operatorOptions.some((option) => option.value === selectedOperatorId)
    ) {
      setValue("operator_id", "")
    }
  }, [
    machineOptions,
    operatorOptions,
    selectedMachineId,
    selectedOperatorId,
    setValue
  ])

  async function onSubmit(data: PastingFormSchema) {
    try {
      const payload = {
        date: data.date,
        shift_id: data.shift_id,
        machine_id: data.machine_id,
        operator_id: data.operator_id,
        battery_model_id: data.battery_model_id,
        plates_qty: data.plates_qty
      }

      const result = isEditing
        ? await updatePastingAction({ id: record!.id, ...payload })
        : await createPastingAction(payload)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar apontamento.")
        return
      }

      toast.success(result.message ?? "Apontamento salvo com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[PastingProductionForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const hasMasterData =
    sectors.length > 0 &&
    shifts.length > 0 &&
    machines.length > 0 &&
    employees.length > 0 &&
    batteryModels.length > 0

  const sectorSelected = Boolean(selectedSectorId)

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      {isEditing && record?.ep_code ? (
        <Input
          label="EP Code"
          value={record.ep_code}
          readOnly
          disabled
          hint="Código de rastreabilidade — não pode ser alterado."
          className="font-mono tabular-nums"
        />
      ) : (
        <p className="rounded-ios-btn border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          O EP Code será gerado automaticamente ao salvar o apontamento.
        </p>
      )}

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
        label="Setor"
        placeholder="Selecione o setor"
        options={sectorOptions}
        disabled={isSubmitting || sectors.length === 0}
        error={
          errors.sector_id?.message ??
          (sectors.length === 0
            ? "Cadastre setores em Configurações."
            : undefined)
        }
        {...register("sector_id")}
      />

      <Select
        label="Máquina"
        placeholder={
          sectorSelected ? "Selecione a máquina" : "Selecione o setor primeiro"
        }
        options={machineOptions}
        disabled={
          isSubmitting || !sectorSelected || machineOptions.length === 0
        }
        error={
          errors.machine_id?.message ??
          (sectorSelected && machineOptions.length === 0
            ? "Nenhuma máquina neste setor."
            : undefined)
        }
        {...register("machine_id")}
      />

      <Select
        label="Operador"
        placeholder={
          sectorSelected ? "Selecione o operador" : "Selecione o setor primeiro"
        }
        options={operatorOptions}
        disabled={
          isSubmitting || !sectorSelected || operatorOptions.length === 0
        }
        error={
          errors.operator_id?.message ??
          (sectorSelected && operatorOptions.length === 0
            ? "Nenhum operador neste setor."
            : undefined)
        }
        {...register("operator_id")}
      />

      <Select
        label="Modelo de bateria"
        placeholder="Selecione o modelo"
        options={batteryModelOptions}
        disabled={isSubmitting || batteryModels.length === 0}
        hint={
          selectedBatteryModel
            ? `Peso nominal de referência: ${selectedBatteryModel.weight_specification.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg`
            : undefined
        }
        error={
          errors.battery_model_id?.message ??
          (batteryModels.length === 0
            ? "Cadastre modelos em Configurações."
            : undefined)
        }
        {...register("battery_model_id")}
      />

      <Input
        label="Quantidade de placas"
        type="number"
        step="1"
        min="1"
        inputMode="numeric"
        placeholder="0"
        disabled={isSubmitting}
        error={errors.plates_qty?.message}
        className="tabular-nums"
        {...register("plates_qty")}
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
          {isEditing ? "Salvar alterações" : "Registrar apontamento"}
        </Button>
      </div>
    </form>
  )
}
