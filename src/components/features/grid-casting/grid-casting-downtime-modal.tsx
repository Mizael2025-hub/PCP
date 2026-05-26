"use client"

import { Modal } from "@/components/ui/modal"
import type { GridCastingProductionWithRelations } from "@/types/grid-casting"
import type { GridCastingDowntimeWithProduction } from "@/types/grid-casting-downtime"

import { GridCastingDowntimeForm } from "./grid-casting-downtime-form"

export type GridCastingDowntimeModalProps = {
  open: boolean
  record?: GridCastingDowntimeWithProduction
  productions: GridCastingProductionWithRelations[]
  onClose: () => void
  onSuccess: () => void
}

export function GridCastingDowntimeModal({
  open,
  record,
  productions,
  onClose,
  onSuccess
}: GridCastingDowntimeModalProps) {
  const isEditing = Boolean(record)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar parada" : "Nova parada de máquina"}
    >
      <GridCastingDowntimeForm
        record={record}
        productions={productions}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
