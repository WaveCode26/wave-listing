import type { Metadata } from 'next'
import { Settings } from 'lucide-react'

export const metadata: Metadata = { title: 'Configurações — Wave Listing' }

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Gerencie sua conta, equipe e integrações</p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-16 text-center">
        <Settings className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Configurações em construção</p>
        <p className="text-zinc-600 text-xs mt-1">Em breve: perfil, equipe, integrações Amazon SP-API, planos</p>
      </div>
    </div>
  )
}
