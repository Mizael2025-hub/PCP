import { SectorsManager } from "@/components/features/sectors/sectors-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { SectorService } from "@/services/sector-service"

export const dynamic = "force-dynamic"

export default async function SetoresPage() {
  const sectorService = new SectorService()
  const result = await sectorService.list()

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Setores"
        description="Cadastro de setores da planta industrial."
      />

      {!result.success ? (
        <ErrorState message={result.message} />
      ) : (
        <SectorsManager initialSectors={result.data ?? []} />
      )}
    </div>
  )
}
