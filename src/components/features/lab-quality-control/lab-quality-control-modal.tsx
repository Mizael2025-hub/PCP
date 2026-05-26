"use client"

import { Modal } from "@/components/ui/modal"
import type { MixerProduction } from "@/types/mixer-production"
import type { LabQualityControlWithRelations } from "@/types/lab-quality-control"

import { LabQualityControlForm } from "./lab-quality-control-form"

export type LabQualityControlModalProps = {
  open: boolean
  record?: LabQualityControlWithRelations
  samples: MixerProduction[]
  onClose: () => void
  onSuccess: () => void
}

export function LabQualityControlModal({
  open,
  record,
  samples,
  onClose,
  onSuccess
}: LabQualityControlModalProps) {
  const isEditing = Boolean(record)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar análise" : "Nova análise"}
    >
      <LabQualityControlForm
        record={record}
        samples={samples}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
