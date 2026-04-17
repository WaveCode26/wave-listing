import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface Alert {
  id: string
  mensagem: string
  severidade: string
  tipo: string
  created_at: string
  products?: { nome_comercial: string } | null
}

interface AlertsFeedProps {
  alerts: Alert[]
}

const severityConfig = {
  critico: { label: 'Crítico', color: 'bg-red-950 text-red-300 border-red-800', icon: AlertCircle },
  alto: { label: 'Alto', color: 'bg-orange-950 text-orange-300 border-orange-800', icon: AlertTriangle },
  medio: { label: 'Médio', color: 'bg-yellow-950 text-yellow-300 border-yellow-800', icon: Info },
  baixo: { label: 'Baixo', color: 'bg-zinc-800 text-zinc-300 border-zinc-700', icon: Info },
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base">Alertas Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-6">Nenhum alerta ativo</p>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 6).map((alert) => {
              const config = severityConfig[alert.severidade as keyof typeof severityConfig] ?? severityConfig.baixo
              const Icon = config.icon
              return (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-md bg-zinc-800/50">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color.includes('red') ? 'text-red-400' : config.color.includes('orange') ? 'text-orange-400' : 'text-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{alert.mensagem}</p>
                    {alert.products?.nome_comercial && (
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{alert.products.nome_comercial}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs shrink-0 ${config.color}`}>
                    {config.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
