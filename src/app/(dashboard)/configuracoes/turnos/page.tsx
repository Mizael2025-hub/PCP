import { ShiftsManager } from "@/components/features/shifts/shifts-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

export default async function TurnosPage() {
  const shiftService = new ShiftService()
  const result = await shiftService.list()

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Turnos"
        description="Cadastro de turnos de trabalho da planta."
      />

      {!result.success ? (
        <ErrorState message={result.message} />
      ) : (
        <ShiftsManager initialShifts={result.data ?? []} />
      )}
    </div>
  )
}
