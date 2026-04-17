'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronLeft, ChevronRight, Trash2, AlertCircle, CalendarDays } from 'lucide-react'
import { ScoreBadge } from '@/components/shared/score-badge'

interface Stage {
  id: string
  label: string
}

interface WorkflowTask {
  id: string
  titulo: string
  descricao: string | null
  stage: string
  prioridade: string
  due_date: string | null
  products: { id: string; nome_comercial: string; sku: string; score_qualidade: number } | null
}

interface Props {
  task: WorkflowTask
  stages: Stage[]
  onStageChange: (taskId: string, stage: string) => void
  onDelete: (taskId: string) => void
  isDragging?: boolean
}

const PRIORIDADE_CONFIG = {
  baixa: 'text-zinc-500 bg-zinc-800',
  media: 'text-blue-400 bg-blue-950',
  alta: 'text-orange-400 bg-orange-950',
  critica: 'text-red-400 bg-red-950',
}

const PRIORIDADE_LABELS = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function KanbanCard({ task, stages, onStageChange, onDelete, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const currentIndex = stages.findIndex(s => s.id === task.stage)
  const canMoveLeft = currentIndex > 0
  const canMoveRight = currentIndex < stages.length - 1

  const overdue = isOverdue(task.due_date)
  const prioConfig = PRIORIDADE_CONFIG[task.prioridade as keyof typeof PRIORIDADE_CONFIG] ?? PRIORIDADE_CONFIG.media

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-zinc-900 p-3 space-y-2.5 select-none transition-opacity ${
        isSortableDragging || isDragging ? 'opacity-50 shadow-xl' : 'opacity-100'
      } ${isDragging ? 'rotate-1 scale-105 border-zinc-600' : 'border-zinc-800 hover:border-zinc-700'}`}
    >
      {/* Top row: drag handle + prioridade */}
      <div className="flex items-center justify-between">
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing p-0.5 -ml-0.5"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${prioConfig}`}>
          {PRIORIDADE_LABELS[task.prioridade as keyof typeof PRIORIDADE_LABELS] ?? task.prioridade}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-white leading-snug line-clamp-2">{task.titulo}</p>

      {/* Product badge */}
      {task.products && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500 line-clamp-1 flex-1">{task.products.nome_comercial}</span>
          <ScoreBadge score={task.products.score_qualidade} size="sm" />
        </div>
      )}

      {/* Due date */}
      {task.due_date && (
        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-zinc-500'}`}>
          {overdue ? <AlertCircle className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
          {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          {overdue && ' · Atrasado'}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => canMoveLeft && onStageChange(task.id, stages[currentIndex - 1].id)}
            disabled={!canMoveLeft}
            className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed rounded"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => canMoveRight && onStageChange(task.id, stages[currentIndex + 1].id)}
            disabled={!canMoveRight}
            className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed rounded"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-zinc-600 hover:text-red-400 rounded"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
