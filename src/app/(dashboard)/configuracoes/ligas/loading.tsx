import { PageHeader } from "@/components/ui/page-header"
import { TableSkeleton } from "@/components/ui/skeleton"

export default function LigasLoading() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ligas de chumbo"
        description="Cadastro de ligas com código e descrição para apontamentos de produção."
      />
      <TableSkeleton rows={6} />
    </div>
  )
}
