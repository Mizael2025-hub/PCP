"use client"

import { Package, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { LeadAlloy } from "@/types/lead-alloy"
import type {
  LeadConsumptionDailySummary,
  LeadConsumptionGroupSummary,
  LeadConsumptionWithRelations
} from "@/types/lead-consumption"
import type { Sector } from "@/types/sector"

import { LeadConsumptionCharts } from "./lead-consumption-charts"
import { LeadConsumptionModal } from "./lead-consumption-modal"
import { LeadConsumptionTable } from "./lead-consumption-table"

export type LeadConsumptionManagerProps = {
  initialRecords: LeadConsumptionWithRelations[]
  dailySummary: LeadConsumptionDailySummary[]
  alloySummary: LeadConsumptionGroupSummary[]
  sectorSummary: LeadConsumptionGroupSummary[]
  alloys: LeadAlloy[]
  sectors: Sector[]
  filters: {
    dateFrom: string
    dateTo: string
    alloyId: string
    destinationSectorId: string
  }
}

export function LeadConsumptionManager({
  initialRecords,
  dailySummary,
  alloySummary,
  sectorSummary,
  alloys,
  sectors,
  filters
}: LeadConsumptionManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    LeadConsumptionWithRelations | undefined
  >()

  const canCreate = alloys.length > 0 && sectors.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Cadastre ligas e setores em Configurações antes de registrar consumo."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: LeadConsumptionWithRelations) {
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

      <LeadConsumptionCharts
        records={initialRecords}
        dailySummary={dailySummary}
        alloySummary={alloySummary}
        sectorSummary={sectorSummary}
      />

      {hasRecords ? (
        <LeadConsumptionTable
          data={initialRecords}
          alloys={alloys}
          sectors={sectors}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={Package}
          title="Nenhum apontamento no período"
          description={
            canCreate
              ? "Registre o consumo de chumbo por liga e setor de destino."
              : "Cadastre ligas e setores em Configurações antes de registrar apontamentos."
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

      <LeadConsumptionModal
        open={modalOpen}
        record={editingRecord}
        alloys={alloys}
        sectors={sectors}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
