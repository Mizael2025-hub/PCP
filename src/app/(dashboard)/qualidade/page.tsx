import Link from "next/link"
import { BatteryCharging, FlaskConical } from "lucide-react"

import { PageHeader } from "@/components/ui/page-header"

export default function QualidadePage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Qualidade"
        description="Controles laboratoriais e formação de baterias."
      />

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Link
          href="/qualidade/laboratorio"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-violet-500/10">
            <FlaskConical
              className="h-5 w-5 text-violet-500"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="font-semibold">Laboratório</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Análises de ácido, densidade, temperatura, status e histórico por
            amostra do misturador.
          </p>
        </Link>

        <Link
          href="/qualidade/formacao"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-indigo-500/10">
            <BatteryCharging
              className="h-5 w-5 text-indigo-500"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="font-semibold">Formação</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Cabeçalho e linhas dinâmicas por circuito, lote de bateria e
            medições elétricas.
          </p>
        </Link>
      </div>
    </div>
  )
}
