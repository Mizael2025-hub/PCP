"use client"

import { Modal } from "@/components/ui/modal"
import type { BatteryModel } from "@/types/battery-model"

import { BatteryModelForm } from "./battery-model-form"

export type BatteryModelModalProps = {
  open: boolean
  batteryModel?: BatteryModel
  onClose: () => void
  onSuccess: () => void
}

export function BatteryModelModal({
  open,
  batteryModel,
  onClose,
  onSuccess
}: BatteryModelModalProps) {
  const isEditing = Boolean(batteryModel)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar modelo de bateria" : "Novo modelo de bateria"}
    >
      <BatteryModelForm
        batteryModel={batteryModel}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
