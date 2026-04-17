import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SeasonalEvent {
  id: string
  nome: string
  data_inicio: string
  data_fim: string
  tipo: string
}

interface UpcomingEventsProps {
  events: SeasonalEvent[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const today = new Date()

  const upcoming = events
    .filter((e) => differenceInDays(parseISO(e.data_inicio), today) >= 0)
    .sort((a, b) => parseISO(a.data_inicio).getTime() - parseISO(b.data_inicio).getTime())
    .slice(0, 5)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Próximas Datas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-6">Nenhum evento próximo</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => {
              const daysLeft = differenceInDays(parseISO(event.data_inicio), today)
              const isUrgent = daysLeft <= 14
              return (
                <div key={event.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 font-medium truncate">{event.nome}</p>
                    <p className="text-xs text-zinc-500">
                      {format(parseISO(event.data_inicio), "d 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs ${
                      isUrgent
                        ? 'bg-orange-950 text-orange-300 border-orange-800'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {daysLeft === 0 ? 'Hoje' : `${daysLeft}d`}
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
