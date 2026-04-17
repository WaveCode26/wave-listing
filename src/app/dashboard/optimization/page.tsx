import type { Metadata } from 'next'
import { BarChart2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Otimização — Wave Listing' }

export default function OptimizationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Otimização</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Performance e testes A/B dos seus listings</p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-16 text-center">
        <BarChart2 className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Módulo de otimização em construção</p>
        <p className="text-zinc-600 text-xs mt-1">Em breve: análise de performance, experimentos A/B, sugestões de melhoria</p>
      </div>
    </div>
  )
}
