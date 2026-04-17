import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-16 text-center">
      <Icon className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
      <p className="text-zinc-300 font-medium">{title}</p>
      {description && <p className="text-zinc-500 text-sm mt-1">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
