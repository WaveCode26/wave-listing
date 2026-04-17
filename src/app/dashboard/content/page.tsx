import type { Metadata } from 'next'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Conteúdo — Wave Listing' }

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Studio</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Criação e edição de listings com IA</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
          <Plus className="h-4 w-4" /> Novo listing
        </Button>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-16 text-center">
        <FileText className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Content Studio em construção</p>
        <p className="text-zinc-600 text-xs mt-1">Em breve: editor de listing, geração por IA, templates</p>
      </div>
    </div>
  )
}
