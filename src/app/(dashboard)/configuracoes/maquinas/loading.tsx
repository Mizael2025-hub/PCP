import { PageHeader } from "@/components/ui/page-header"
import { TableSkeleton } from "@/components/ui/skeleton"

export default function MaquinasLoading() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Máquinas"
        description="Cadastro de equipamentos vinculados aos setores."
      />
      <TableSkeleton rows={6} />
    </div>
  )
}
