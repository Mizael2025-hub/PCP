import { PageHeader } from "@/components/ui/page-header"
import { TableSkeleton } from "@/components/ui/skeleton"

export default function SetoresLoading() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Setores"
        description="Cadastro de setores da planta industrial."
      />
      <TableSkeleton rows={6} />
    </div>
  )
}
