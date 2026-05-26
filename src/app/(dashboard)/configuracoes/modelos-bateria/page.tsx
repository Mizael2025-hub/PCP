import { BatteryModelsManager } from "@/components/features/battery-models/battery-models-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { BatteryModelService } from "@/services/battery-model-service"

export const dynamic = "force-dynamic"

export default async function ModelosBateriaPage() {
  const batteryModelService = new BatteryModelService()
  const result = await batteryModelService.list()

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Modelos de bateria"
        description="Cadastro de modelos com código, nome e peso nominal de referência."
      />

      {!result.success ? (
        <ErrorState message={result.message} />
      ) : (
        <BatteryModelsManager initialBatteryModels={result.data ?? []} />
      )}
    </div>
  )
}
