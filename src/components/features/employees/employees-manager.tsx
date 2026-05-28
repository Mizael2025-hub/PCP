"use client"

import { Plus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deleteEmployeeAction } from "@/actions/employee-actions"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Modal } from "@/components/ui/modal"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { EmployeeWithSector } from "@/types/employee"
import type { Sector } from "@/types/sector"

import { EmployeeModal } from "./employee-modal"
import { EmployeesTable } from "./employees-table"

export type EmployeesManagerProps = {
  initialEmployees: EmployeeWithSector[]
  sectors: Sector[]
}

export function EmployeesManager({
  initialEmployees,
  sectors
}: EmployeesManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<
    EmployeeWithSector | undefined
  >()
  const [deletingEmployee, setDeletingEmployee] =
    useState<EmployeeWithSector | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canCreate = sectors.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error("Cadastre um setor antes de criar funcionários.")
      return
    }

    setEditingEmployee(undefined)
    setModalOpen(true)
  }

  function openEdit(employee: EmployeeWithSector) {
    setEditingEmployee(employee)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingEmployee(undefined)
  }

  function openDeleteConfirm(employee: EmployeeWithSector) {
    setDeletingEmployee(employee)
  }

  function closeDeleteConfirm() {
    setDeletingEmployee(null)
  }

  async function confirmDelete() {
    if (!deletingEmployee) {
      return
    }

    setDeletingId(deletingEmployee.id)

    try {
      const result = await deleteEmployeeAction(deletingEmployee.id)

      const ok = toastFromActionResponse(result, {
        successFallback: "Funcionário desativado com sucesso.",
        errorFallback: "Erro ao excluir funcionário."
      })
      if (!ok) return

      closeDeleteConfirm()
      handleRefresh()
    } catch (error) {
      console.error("[EmployeesManager.confirmDelete]", error)
      toast.error("Erro interno.")
    } finally {
      setDeletingId(null)
    }
  }

  const hasEmployees = initialEmployees.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          onClick={openCreate}
          icon={Plus}
          disabled={!canCreate}
        >
          Novo funcionário
        </Button>
      </div>

      {hasEmployees ? (
        <EmployeesTable
          data={initialEmployees}
          sectors={sectors}
          onEdit={openEdit}
          onDelete={openDeleteConfirm}
          deletingId={deletingId}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="Nenhum funcionário cadastrado"
          description={
            canCreate
              ? "Cadastre operadores vinculados aos setores da planta."
              : "Cadastre ao menos um setor antes de criar funcionários."
          }
          action={
            canCreate ? (
              <Button type="button" onClick={openCreate} icon={Plus}>
                Novo funcionário
              </Button>
            ) : undefined
          }
        />
      )}

      <EmployeeModal
        open={modalOpen}
        employee={editingEmployee}
        sectors={sectors}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />

      <Modal
        open={Boolean(deletingEmployee)}
        onClose={closeDeleteConfirm}
        title="Excluir funcionário"
      >
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            {deletingEmployee?.name}
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
