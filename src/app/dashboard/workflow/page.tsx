import type { Metadata } from 'next'
import { Kanban } from 'lucide-react'

export const metadata: Metadata = { title: 'Workflow — Wave Listing' }

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Workflow</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Kanban de aprovação de listings</p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-16 text-center">
        <Kanban className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Kanban em construção</p>
        <p className="text-zinc-600 text-xs mt-1">Em breve: board drag-and-drop, SLAs, checklist de conformidade</p>
      </div>
    </div>
  )
}
