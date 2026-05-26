"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createGridCastingAction,
  updateGridCastingAction
} from "@/actions/grid-casting-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { BatteryModel } from "@/types/battery-model"
import type { EmployeeWithSector } from "@/types/employee"
import type { GridCastingProductionWithRelations } from "@/types/grid-casting"
import type { LeadAlloy } from "@/types/lead-alloy"
import type { MachineWithSector } from "@/types/machine"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"
import {
  gridCastingFormSchema,
  type GridCastingFormSchema
} from "@/validations/grid-casting/production-schema"

export type GridCastingFormProps = {
  record?: GridCastingProductionWithRelations
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  alloys: LeadAlloy[]
  batteryModels: BatteryModel[]
  onSuccess: () => void
  onCancel: () => void
}

function resolveSectorId(
  record: GridCastingProductionWithRelations | undefined
): string {
  return record?.machines?.sector_id ?? record?.employees?.sector_id ?? ""
}

export function GridCastingForm({
  record,
  sectors,
  shifts,
  machines,
  employees,
  alloys,
  batteryModels,
  onSuccess,
  onCancel
}: GridCastingFormProps) {
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

  const alloyOptions = useMemo(
    () =>
      alloys.map((alloy) => ({
        value: alloy.id,
        label: alloy.description
          ? `${alloy.code} — ${alloy.description}`
          : alloy.code
      })),
    [alloys]
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
  } = useForm<GridCastingFormSchema>({
    resolver: zodResolver(gridCastingFormSchema),
    defaultValues: {
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      sector_id: resolveSectorId(record),
      machine_id: record?.machine_id ?? "",
      operator_id: record?.operator_id ?? "",
      alloy_id: record?.alloy_id ?? "",
      battery_model_id: record?.battery_model_id ?? "",
      gross_weight: record?.gross_weight ?? ("" as unknown as number),
      net_weight: record?.net_weight ?? ("" as unknown as number),
      produced_qty: record?.produced_qty ?? ("" as unknown as number)
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
      alloy_id: record?.alloy_id ?? "",
      battery_model_id: record?.battery_model_id ?? "",
      gross_weight: record?.gross_weight ?? ("" as unknown as number),
      net_weight: record?.net_weight ?? ("" as unknown as number),
      produced_qty: record?.produced_qty ?? ("" as unknown as number)
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

  async function onSubmit(data: GridCastingFormSchema) {
    try {
      const payload = {
        date: data.date,
        shift_id: data.shift_id,
        machine_id: data.machine_id,
        operator_id: data.operator_id,
        alloy_id: data.alloy_id,
        battery_model_id: data.battery_model_id,
        gross_weight: data.gross_weight,
        net_weight: data.net_weight,
        produced_qty: data.produced_qty
      }

      const result = isEditing
        ? await updateGridCastingAction({ id: record!.id, ...payload })
        : await createGridCastingAction(payload)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar apontamento.")
        return
      }

      toast.success(result.message ?? "Apontamento salvo com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[GridCastingForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const hasMasterData =
    sectors.length > 0 &&
    shifts.length > 0 &&
    machines.length > 0 &&
    employees.length > 0 &&
    alloys.length > 0 &&
    batteryModels.length > 0

  const sectorSelected = Boolean(selectedSectorId)

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
        label="Liga de chumbo"
        placeholder="Selecione a liga"
        options={alloyOptions}
        disabled={isSubmitting || alloys.length === 0}
        error={
          errors.alloy_id?.message ??
          (alloys.length === 0 ? "Cadastre ligas em Configurações." : undefined)
        }
        {...register("alloy_id")}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Peso bruto (kg)"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          placeholder="0,000"
          disabled={isSubmitting}
          error={errors.gross_weight?.message}
          className="tabular-nums"
          {...register("gross_weight")}
        />

        <Input
          label="Peso líquido (kg)"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          placeholder="0,000"
          disabled={isSubmitting}
          error={errors.net_weight?.message}
          className="tabular-nums"
          {...register("net_weight")}
        />
      </div>

      <Input
        label="Quantidade produzida"
        type="number"
        step="1"
        min="1"
        inputMode="numeric"
        placeholder="0"
        disabled={isSubmitting}
        error={errors.produced_qty?.message}
        className="tabular-nums"
        {...register("produced_qty")}
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
