import { LeadAlloysManager } from "@/components/features/lead-alloys/lead-alloys-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { LeadAlloyService } from "@/services/lead-alloy-service"

export const dynamic = "force-dynamic"

export default async function LigasPage() {
  const leadAlloyService = new LeadAlloyService()
  const result = await leadAlloyService.list()

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ligas de chumbo"
        description="Cadastro de ligas com código e descrição para apontamentos de produção."
      />

      {!result.success ? (
        <ErrorState message={result.message} />
      ) : (
        <LeadAlloysManager initialLeadAlloys={result.data ?? []} />
      )}
    </div>
  )
}
