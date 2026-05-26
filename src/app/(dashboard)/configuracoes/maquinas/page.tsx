import { MachinesManager } from "@/components/features/machines/machines-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { MachineService } from "@/services/machine-service"
import { SectorService } from "@/services/sector-service"

export const dynamic = "force-dynamic"

export default async function MaquinasPage() {
  const machineService = new MachineService()
  const sectorService = new SectorService()

  const [machinesResult, sectorsResult] = await Promise.all([
    machineService.list(),
    sectorService.list()
  ])

  if (!machinesResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Máquinas"
          description="Cadastro de equipamentos vinculados aos setores."
        />
        <ErrorState message={machinesResult.message} />
      </div>
    )
  }

  if (!sectorsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Máquinas"
          description="Cadastro de equipamentos vinculados aos setores."
        />
        <ErrorState message={sectorsResult.message} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Máquinas"
        description="Cadastro de equipamentos vinculados aos setores."
      />

      <MachinesManager
        initialMachines={machinesResult.data ?? []}
        sectors={sectorsResult.data ?? []}
      />
    </div>
  )
}
