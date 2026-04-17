import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

function getScoreColor(score: number) {
  if (score >= 90) return 'bg-green-950 text-green-400 border-green-800'
  if (score >= 75) return 'bg-blue-950 text-blue-400 border-blue-800'
  if (score >= 55) return 'bg-yellow-950 text-yellow-400 border-yellow-800'
  if (score >= 35) return 'bg-orange-950 text-orange-400 border-orange-800'
  return 'bg-red-950 text-red-400 border-red-800'
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Excelente'
  if (score >= 75) return 'Bom'
  if (score >= 55) return 'Regular'
  if (score >= 35) return 'Fraco'
  return 'Crítico'
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      getScoreColor(score),
      size === 'sm' && 'px-2 py-0.5 text-xs',
      size === 'md' && 'px-2.5 py-1 text-sm',
      size === 'lg' && 'px-4 py-1.5 text-base',
    )}>
      <span className="tabular-nums">{score}</span>
      <span className="opacity-70 text-xs">{getScoreLabel(score)}</span>
    </span>
  )
}
