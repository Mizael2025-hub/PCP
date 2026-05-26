"use client"

import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { EmployeeWithSector } from "@/types/employee"
import type {
  SandingScrapDailySummary,
  SandingScrapOperatorSummary,
  SandingScrapWithRelations
} from "@/types/sanding-scrap"

import { SandingScrapCharts } from "./sanding-scrap-charts"
import { SandingScrapModal } from "./sanding-scrap-modal"
import { SandingScrapTable } from "./sanding-scrap-table"

export type SandingScrapManagerProps = {
  initialRecords: SandingScrapWithRelations[]
  dailySummary: SandingScrapDailySummary[]
  operatorSummary: SandingScrapOperatorSummary[]
  employees: EmployeeWithSector[]
  filters: {
    dateFrom: string
    dateTo: string
    operatorId: string
  }
}

export function SandingScrapManager({
  initialRecords,
  dailySummary,
  operatorSummary,
  employees,
  filters
}: SandingScrapManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    SandingScrapWithRelations | undefined
  >()

  const canCreate = employees.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Cadastre funcionários em Configurações antes de registrar refugo."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: SandingScrapWithRelations) {
    setEditingRecord(record)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingRecord(undefined)
  }

  const hasRecords = initialRecords.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          onClick={openCreate}
          icon={Plus}
          disabled={!canCreate}
        >
          Novo apontamento
        </Button>
      </div>

      <SandingScrapCharts
        records={initialRecords}
        dailySummary={dailySummary}
        operatorSummary={operatorSummary}
      />

      {hasRecords ? (
        <SandingScrapTable
          data={initialRecords}
          employees={employees}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={Trash2}
          title="Nenhum apontamento no período"
          description={
            canCreate
              ? "Registre o refugo de lixação com peso e placas perdidas."
              : "Cadastre funcionários em Configurações antes de registrar apontamentos."
          }
          action={
            canCreate ? (
              <Button type="button" onClick={openCreate} icon={Plus}>
                Novo apontamento
              </Button>
            ) : undefined
          }
        />
      )}

      <SandingScrapModal
        open={modalOpen}
        record={editingRecord}
        employees={employees}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
