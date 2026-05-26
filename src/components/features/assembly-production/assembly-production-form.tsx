"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  createAssemblyAction,
  updateAssemblyAction
} from "@/actions/assembly-production-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { jsonToCharacteristicEntries } from "@/lib/utils/lot-characteristics"
import type { AssemblyProductionWithRelations } from "@/types/assembly-production"
import type { EmployeeWithSector } from "@/types/employee"
import type { MachineWithSector } from "@/types/machine"
import type { PastingProduction } from "@/types/pasting-production"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"
import {
  assemblyFormSchema,
  type AssemblyFormSchema
} from "@/validations/assembly-production/production-schema"

import { LotCharacteristicsEditor } from "./lot-characteristics-editor"

export type AssemblyProductionFormProps = {
  record?: AssemblyProductionWithRelations
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  availablePasting: PastingProduction[]
  onSuccess: () => void
  onCancel: () => void
}

function resolveSectorId(
  record: AssemblyProductionWithRelations | undefined
): string {
  return record?.machines?.sector_id ?? record?.employees?.sector_id ?? ""
}

export function AssemblyProductionForm({
  record,
  sectors,
  shifts,
  machines,
  employees,
  availablePasting,
  onSuccess,
  onCancel
}: AssemblyProductionFormProps) {
  const isEditing = Boolean(record)
  const today = format(new Date(), "yyyy-MM-dd")

  const pastingOptionsForForm = useMemo(() => {
    const options = [...availablePasting]

    if (
      record?.pasting_production &&
      !options.some((item) => item.id === record.pasting_production_id)
    ) {
      options.unshift({
        id: record.pasting_production.id,
        ep_code: record.pasting_production.ep_code,
        date: record.pasting_production.date,
        shift_id: record.shift_id,
        machine_id: record.machine_id,
        operator_id: record.operator_id,
        battery_model_id: record.pasting_production.battery_model_id,
        plates_qty: record.pasting_production.plates_qty,
        created_at: record.created_at
      })
    }

    return options
  }, [availablePasting, record])

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

  const pastingOptions = useMemo(
    () =>
      pastingOptionsForForm.map((pasting) => ({
        value: pasting.id,
        label: pasting.ep_code
      })),
    [pastingOptionsForForm]
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting }
  } = useForm<AssemblyFormSchema>({
    resolver: zodResolver(assemblyFormSchema),
    defaultValues: {
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      sector_id: resolveSectorId(record),
      machine_id: record?.machine_id ?? "",
      operator_id: record?.operator_id ?? "",
      pasting_production_id: record?.pasting_production_id ?? "",
      produced_qty: record?.produced_qty ?? ("" as unknown as number),
      characteristics: jsonToCharacteristicEntries(record?.lot_characteristics)
    }
  })

  const selectedSectorId = watch("sector_id")
  const selectedMachineId = watch("machine_id")
  const selectedOperatorId = watch("operator_id")
  const selectedPastingId = watch("pasting_production_id")

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

  const selectedPasting = useMemo(
    () =>
      pastingOptionsForForm.find((item) => item.id === selectedPastingId) ??
      null,
    [pastingOptionsForForm, selectedPastingId]
  )

  useEffect(() => {
    reset({
      date: record?.date ?? today,
      shift_id: record?.shift_id ?? "",
      sector_id: resolveSectorId(record),
      machine_id: record?.machine_id ?? "",
      operator_id: record?.operator_id ?? "",
      pasting_production_id: record?.pasting_production_id ?? "",
      produced_qty: record?.produced_qty ?? ("" as unknown as number),
      characteristics: jsonToCharacteristicEntries(record?.lot_characteristics)
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

  async function onSubmit(data: AssemblyFormSchema) {
    try {
      const payload = {
        date: data.date,
        shift_id: data.shift_id,
        machine_id: data.machine_id,
        operator_id: data.operator_id,
        pasting_production_id: data.pasting_production_id,
        produced_qty: data.produced_qty,
        characteristics: data.characteristics
      }

      const result = isEditing
        ? await updateAssemblyAction({ id: record!.id, ...payload })
        : await createAssemblyAction(payload)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao salvar apontamento.")
        return
      }

      toast.success(result.message ?? "Apontamento salvo com sucesso.")
      onSuccess()
    } catch (error) {
      console.error("[AssemblyProductionForm.onSubmit]", error)
      toast.error("Erro interno.")
    }
  }

  const hasMasterData =
    sectors.length > 0 &&
    shifts.length > 0 &&
    machines.length > 0 &&
    employees.length > 0

  const sectorSelected = Boolean(selectedSectorId)

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      {isEditing && record?.battery_lot_code ? (
        <Input
          label="Lote da bateria"
          value={record.battery_lot_code}
          readOnly
          disabled
          hint="Código de rastreabilidade — não pode ser alterado."
          className="font-mono tabular-nums"
        />
      ) : (
        <p className="rounded-ios-btn border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          O lote da bateria será gerado automaticamente ao salvar o apontamento.
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

      {isEditing ? (
        <>
          <input type="hidden" {...register("pasting_production_id")} />
          <Input
            label="EP Code de origem"
            value={record?.pasting_production?.ep_code ?? "—"}
            readOnly
            disabled
            hint="Rastreabilidade com a empastadeira — não pode ser alterado."
            className="font-mono tabular-nums"
          />
        </>
      ) : (
        <Select
          label="EP Code de origem"
          placeholder={
            pastingOptions.length > 0
              ? "Selecione o EP Code"
              : "Nenhum EP disponível"
          }
          options={pastingOptions}
          disabled={isSubmitting || pastingOptions.length === 0}
          hint={
            selectedPasting
              ? `Placas do EP: ${selectedPasting.plates_qty.toLocaleString("pt-BR")}`
              : "Somente EP Codes ainda não vinculados a montagem."
          }
          error={
            errors.pasting_production_id?.message ??
            (pastingOptions.length === 0
              ? "Registre produção na empastadeira antes da montagem."
              : undefined)
          }
          className="font-mono"
          {...register("pasting_production_id")}
        />
      )}

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

      <LotCharacteristicsEditor
        control={control}
        errors={errors.characteristics}
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
          disabled={
            !hasMasterData || (!isEditing && pastingOptions.length === 0)
          }
        >
          {isEditing ? "Salvar alterações" : "Registrar apontamento"}
        </Button>
      </div>
    </form>
  )
}
