'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KanbanBoard, WorkflowTask } from '@/components/workflow/kanban-board'
import { AddTaskDialog } from '@/components/workflow/add-task-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Kanban } from 'lucide-react'

export default function WorkflowPage() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetch('/api/workflow')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setTasks(data); setLoading(false) })
  }, [])

  function handleCreated(task: unknown) {
    setTasks(prev => [task as WorkflowTask, ...prev])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflow</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Kanban de aprovação de listings</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <div className="h-5 bg-zinc-800 rounded w-24 mb-3 animate-pulse" />
              <div className="space-y-2.5">
                {[...Array(i % 2 === 0 ? 2 : 1)].map((_, j) => (
                  <div key={j} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="Nenhuma tarefa criada"
          description="Crie tarefas para acompanhar o progresso dos seus listings."
          action={
            <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
              <Plus className="h-4 w-4" /> Nova tarefa
            </Button>
          }
        />
      ) : (
        <KanbanBoard initialTasks={tasks} />
      )}

      <AddTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
