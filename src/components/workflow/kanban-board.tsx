'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './kanban-card'
import { KanbanColumn } from './kanban-column'

export interface WorkflowTask {
  id: string
  titulo: string
  descricao: string | null
  stage: string
  prioridade: string
  due_date: string | null
  products: { id: string; nome_comercial: string; sku: string; score_qualidade: number } | null
}

const STAGES = [
  { id: 'backlog', label: 'Backlog', color: 'border-zinc-700' },
  { id: 'em_criacao', label: 'Em criação', color: 'border-blue-700' },
  { id: 'revisao', label: 'Revisão', color: 'border-yellow-700' },
  { id: 'aprovacao', label: 'Aprovação', color: 'border-purple-700' },
  { id: 'publicado', label: 'Publicado', color: 'border-green-700' },
]

interface Props {
  initialTasks: WorkflowTask[]
}

export function KanbanBoard({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<WorkflowTask[]>(initialTasks)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const activeTask = tasks.find(t => t.id === activeId)

  function getTasksByStage(stage: string) {
    return tasks.filter(t => t.stage === stage)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeTaskId = active.id as string
    const overId = over.id as string

    // Check if dragging over a column
    const overStage = STAGES.find(s => s.id === overId)
    if (overStage) {
      setTasks(prev => prev.map(t =>
        t.id === activeTaskId ? { ...t, stage: overStage.id } : t
      ))
    }
  }

  const persistStage = useCallback(async (taskId: string, stage: string) => {
    await fetch(`/api/workflow/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeTaskId = active.id as string
    const task = tasks.find(t => t.id === activeTaskId)
    if (task) {
      persistStage(activeTaskId, task.stage)
    }
  }

  function handleStageChange(taskId: string, newStage: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage: newStage } : t))
    persistStage(taskId, newStage)
  }

  function handleDelete(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    fetch(`/api/workflow/${taskId}`, { method: 'DELETE' })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {STAGES.map(stage => {
          const stageTasks = getTasksByStage(stage.id)
          return (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              label={stage.label}
              colorClass={stage.color}
              count={stageTasks.length}
            >
              <SortableContext
                items={stageTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {stageTasks.map(task => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    stages={STAGES}
                    onStageChange={handleStageChange}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <KanbanCard
            task={activeTask}
            stages={STAGES}
            onStageChange={() => {}}
            onDelete={() => {}}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
