"use client"

import { Modal } from "@/components/ui/modal"
import type { LeadAlloy } from "@/types/lead-alloy"

import { LeadAlloyForm } from "./lead-alloy-form"

export type LeadAlloyModalProps = {
  open: boolean
  leadAlloy?: LeadAlloy
  onClose: () => void
  onSuccess: () => void
}

export function LeadAlloyModal({
  open,
  leadAlloy,
  onClose,
  onSuccess
}: LeadAlloyModalProps) {
  const isEditing = Boolean(leadAlloy)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar liga" : "Nova liga"}
    >
      <LeadAlloyForm
        leadAlloy={leadAlloy}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
