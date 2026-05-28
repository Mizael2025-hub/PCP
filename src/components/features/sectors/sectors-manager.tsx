"use client"

import { Building2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deleteSectorAction } from "@/actions/sector-actions"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Modal } from "@/components/ui/modal"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { Sector } from "@/types/sector"

import { SectorModal } from "./sector-modal"
import { SectorsTable } from "./sectors-table"

export type SectorsManagerProps = {
  initialSectors: Sector[]
}

export function SectorsManager({ initialSectors }: SectorsManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSector, setEditingSector] = useState<Sector | undefined>()
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    setEditingSector(undefined)
    setModalOpen(true)
  }

  function openEdit(sector: Sector) {
    setEditingSector(sector)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingSector(undefined)
  }

  function openDeleteConfirm(sector: Sector) {
    setDeletingSector(sector)
  }

  function closeDeleteConfirm() {
    setDeletingSector(null)
  }

  async function confirmDelete() {
    if (!deletingSector) {
      return
    }

    setDeletingId(deletingSector.id)

    try {
      const result = await deleteSectorAction(deletingSector.id)

      const ok = toastFromActionResponse(result, {
        successFallback: "Setor desativado com sucesso.",
        errorFallback: "Erro ao excluir setor."
      })
      if (!ok) return

      closeDeleteConfirm()
      handleRefresh()
    } catch (error) {
      console.error("[SectorsManager.confirmDelete]", error)
      toast.error("Erro interno.")
    } finally {
      setDeletingId(null)
    }
  }

  const hasSectors = initialSectors.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={openCreate} icon={Plus}>
          Novo setor
        </Button>
      </div>

      {hasSectors ? (
        <SectorsTable
          data={initialSectors}
          onEdit={openEdit}
          onDelete={openDeleteConfirm}
          deletingId={deletingId}
        />
      ) : (
        <EmptyState
          icon={Building2}
          title="Nenhum setor cadastrado"
          description="Crie o primeiro setor para organizar máquinas e operadores."
          action={
            <Button type="button" onClick={openCreate} icon={Plus}>
              Novo setor
            </Button>
          }
        />
      )}

      <SectorModal
        open={modalOpen}
        sector={editingSector}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />

      <Modal
        open={Boolean(deletingSector)}
        onClose={closeDeleteConfirm}
        title="Excluir setor"
      >
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            {deletingSector?.name}
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
