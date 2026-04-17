import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Package, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface StatsCardsProps {
  totalProducts: number
  avgScore: number
  criticalAlerts: number
  healthyProducts: number
}

export function StatsCards({ totalProducts, avgScore, criticalAlerts, healthyProducts }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total de SKUs',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-950',
    },
    {
      label: 'Score Médio',
      value: `${avgScore}/100`,
      icon: TrendingUp,
      color: avgScore >= 75 ? 'text-green-400' : avgScore >= 55 ? 'text-yellow-400' : 'text-red-400',
      bg: avgScore >= 75 ? 'bg-green-950' : avgScore >= 55 ? 'bg-yellow-950' : 'bg-red-950',
    },
    {
      label: 'Alertas Críticos',
      value: criticalAlerts,
      icon: AlertTriangle,
      color: criticalAlerts > 0 ? 'text-red-400' : 'text-zinc-400',
      bg: criticalAlerts > 0 ? 'bg-red-950' : 'bg-zinc-800',
    },
    {
      label: 'SKUs Saudáveis',
      value: healthyProducts,
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-950',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
