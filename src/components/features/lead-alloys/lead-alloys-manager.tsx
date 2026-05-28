"use client"

import { FlaskConical, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deleteLeadAlloyAction } from "@/actions/lead-alloy-actions"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Modal } from "@/components/ui/modal"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { LeadAlloy } from "@/types/lead-alloy"

import { LeadAlloyModal } from "./lead-alloy-modal"
import { LeadAlloysTable } from "./lead-alloys-table"

export type LeadAlloysManagerProps = {
  initialLeadAlloys: LeadAlloy[]
}

export function LeadAlloysManager({
  initialLeadAlloys
}: LeadAlloysManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLeadAlloy, setEditingLeadAlloy] = useState<
    LeadAlloy | undefined
  >()
  const [deletingLeadAlloy, setDeletingLeadAlloy] = useState<LeadAlloy | null>(
    null
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    setEditingLeadAlloy(undefined)
    setModalOpen(true)
  }

  function openEdit(leadAlloy: LeadAlloy) {
    setEditingLeadAlloy(leadAlloy)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingLeadAlloy(undefined)
  }

  function openDeleteConfirm(leadAlloy: LeadAlloy) {
    setDeletingLeadAlloy(leadAlloy)
  }

  function closeDeleteConfirm() {
    setDeletingLeadAlloy(null)
  }

  async function confirmDelete() {
    if (!deletingLeadAlloy) {
      return
    }

    setDeletingId(deletingLeadAlloy.id)

    try {
      const result = await deleteLeadAlloyAction(deletingLeadAlloy.id)

      const ok = toastFromActionResponse(result, {
        successFallback: "Liga desativada com sucesso.",
        errorFallback: "Erro ao excluir liga."
      })
      if (!ok) return

      closeDeleteConfirm()
      handleRefresh()
    } catch (error) {
      console.error("[LeadAlloysManager.confirmDelete]", error)
      toast.error("Erro interno.")
    } finally {
      setDeletingId(null)
    }
  }

  const hasLeadAlloys = initialLeadAlloys.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={openCreate} icon={Plus}>
          Nova liga
        </Button>
      </div>

      {hasLeadAlloys ? (
        <LeadAlloysTable
          data={initialLeadAlloys}
          onEdit={openEdit}
          onDelete={openDeleteConfirm}
          deletingId={deletingId}
        />
      ) : (
        <EmptyState
          icon={FlaskConical}
          title="Nenhuma liga cadastrada"
          description="Cadastre as ligas de chumbo usadas na fundição de grades."
          action={
            <Button type="button" onClick={openCreate} icon={Plus}>
              Nova liga
            </Button>
          }
        />
      )}

      <LeadAlloyModal
        open={modalOpen}
        leadAlloy={editingLeadAlloy}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />

      <Modal
        open={Boolean(deletingLeadAlloy)}
        onClose={closeDeleteConfirm}
        title="Excluir liga"
      >
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            {deletingLeadAlloy?.code}
          </strong>
          ? O registro será desativado e não aparecerá mais na listagem.
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={closeDeleteConfirm}
            disabled={deletingId !== null}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmDelete}
            isLoading={deletingId !== null}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  )
}
