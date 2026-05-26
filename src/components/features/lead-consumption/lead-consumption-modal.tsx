"use client"

import { Modal } from "@/components/ui/modal"
import type { LeadAlloy } from "@/types/lead-alloy"
import type { LeadConsumptionWithRelations } from "@/types/lead-consumption"
import type { Sector } from "@/types/sector"

import { LeadConsumptionForm } from "./lead-consumption-form"

export type LeadConsumptionModalProps = {
  open: boolean
  record?: LeadConsumptionWithRelations
  alloys: LeadAlloy[]
  sectors: Sector[]
  onClose: () => void
  onSuccess: () => void
}

export function LeadConsumptionModal({
  open,
  record,
  alloys,
  sectors,
  onClose,
  onSuccess
}: LeadConsumptionModalProps) {
  const isEditing = Boolean(record)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar apontamento" : "Novo consumo"}
    >
      <LeadConsumptionForm
        record={record}
        alloys={alloys}
        sectors={sectors}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
