"use client"

import { Clock, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deleteShiftAction } from "@/actions/shift-actions"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Modal } from "@/components/ui/modal"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import { formatTimeDisplay } from "@/lib/utils/time"
import type { Shift } from "@/types/shift"

import { ShiftModal } from "./shift-modal"
import { ShiftsTable } from "./shifts-table"

export type ShiftsManagerProps = {
  initialShifts: Shift[]
}

export function ShiftsManager({ initialShifts }: ShiftsManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | undefined>()
  const [deletingShift, setDeletingShift] = useState<Shift | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    setEditingShift(undefined)
    setModalOpen(true)
  }

  function openEdit(shift: Shift) {
    setEditingShift(shift)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingShift(undefined)
  }

  function openDeleteConfirm(shift: Shift) {
    setDeletingShift(shift)
  }

  function closeDeleteConfirm() {
    setDeletingShift(null)
  }

  async function confirmDelete() {
    if (!deletingShift) {
      return
    }

    setDeletingId(deletingShift.id)

    try {
      const result = await deleteShiftAction(deletingShift.id)

      const ok = toastFromActionResponse(result, {
        successFallback: "Turno excluído com sucesso.",
        errorFallback: "Erro ao excluir turno."
      })
      if (!ok) return

      closeDeleteConfirm()
      handleRefresh()
    } catch (error) {
      console.error("[ShiftsManager.confirmDelete]", error)
      toast.error("Erro interno.")
    } finally {
      setDeletingId(null)
    }
  }

  const hasShifts = initialShifts.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={openCreate} icon={Plus}>
          Novo turno
        </Button>
      </div>

      {hasShifts ? (
        <ShiftsTable
          data={initialShifts}
          onEdit={openEdit}
          onDelete={openDeleteConfirm}
          deletingId={deletingId}
        />
      ) : (
        <EmptyState
          icon={Clock}
          title="Nenhum turno cadastrado"
          description="Cadastre os turnos de trabalho com horário de início e fim."
          action={
            <Button type="button" onClick={openCreate} icon={Plus}>
              Novo turno
            </Button>
          }
        />
      )}

      <ShiftModal
        open={modalOpen}
        shift={editingShift}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />

      <Modal
        open={Boolean(deletingShift)}
        onClose={closeDeleteConfirm}
        title="Excluir turno"
      >
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            {deletingShift?.name}
          </strong>
          {deletingShift ? (
            <>
              {" "}
              ({formatTimeDisplay(deletingShift.start_time)} –{" "}
              {formatTimeDisplay(deletingShift.end_time)})
            </>
          ) : null}
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
