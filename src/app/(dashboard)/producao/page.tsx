import Link from "next/link"
import {
  Battery,
  Blend,
  CircleDot,
  FlaskConical,
  Grid3X3,
  Layers,
  Package,
  Trash2
} from "lucide-react"

import { PageHeader } from "@/components/ui/page-header"

export default function ProducaoPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Produção"
        description="Apontamentos de peso e paradas de máquina."
      />

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Link
          href="/producao/grid-casting"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-blue-500/10">
            <Grid3X3 className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Fundidora de Grades</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Apontamentos de produção, paradas de máquina e histórico por turno.
          </p>
        </Link>

        <Link
          href="/producao/lead-ball"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-amber-500/10">
            <CircleDot className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Boleira</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Produção de bola de chumbo por silo, peso e histórico por turno.
          </p>
        </Link>

        <Link
          href="/producao/oxide-mill"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-violet-500/10">
            <FlaskConical
              className="h-5 w-5 text-violet-500"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="font-semibold">Moinho de Óxido</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Peso de óxido, grau de oxidação, gráficos e histórico por turno.
          </p>
        </Link>

        <Link
          href="/producao/mixer"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-emerald-500/10">
            <Blend className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Misturador</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Batelada, volumes, densidade e histórico por turno.
          </p>
        </Link>

        <Link
          href="/producao/pasting"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-sky-500/10">
            <Layers className="h-5 w-5 text-sky-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Empastadeira</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Geração de EP Code, rastreabilidade e histórico por turno e modelo.
          </p>
        </Link>

        <Link
          href="/producao/assembly"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-indigo-500/10">
            <Battery className="h-5 w-5 text-indigo-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Montagem</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Lote da bateria, EP Code de origem, características do lote e
            histórico.
          </p>
        </Link>

        <Link
          href="/producao/sanding-scrap"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-orange-500/10">
            <Trash2 className="h-5 w-5 text-orange-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Lixação</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Refugo com peso e placas perdidas, gráficos e histórico por
            operador.
          </p>
        </Link>

        <Link
          href="/producao/lead-consumption"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-rose-500/10">
            <Package className="h-5 w-5 text-rose-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Consumo de Chumbo</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Consumo por liga e setor de destino, gráficos e histórico.
          </p>
        </Link>
      </div>
    </div>
  )
}
