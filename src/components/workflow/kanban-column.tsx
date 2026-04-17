'use client'

import { useDroppable } from '@dnd-kit/core'

interface Props {
  id: string
  label: string
  colorClass: string
  count: number
  children: React.ReactNode
}

export function KanbanColumn({ id, label, colorClass, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex-shrink-0 w-64">
      {/* Column header */}
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${colorClass}`}>
        <span className="text-sm font-semibold text-zinc-300">{label}</span>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{count}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`space-y-2.5 min-h-[120px] rounded-lg p-2 transition-colors ${
          isOver ? 'bg-zinc-800/50 ring-1 ring-zinc-600' : ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}
