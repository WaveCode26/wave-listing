import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { AlertsFeed } from '@/components/dashboard/alerts-feed'
import { UpcomingEvents } from '@/components/dashboard/upcoming-events'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Wave Listing' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar organização do usuário
  const { data: member } = await supabase
    .from('members')
    .select('organization_id, organizations(name)')
    .eq('user_id', user!.id)
    .single()

  const orgId = member?.organization_id

  // Buscar dados em paralelo
  const [productsResult, alertsResult, eventsResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, score_qualidade, estado')
      .eq('organization_id', orgId ?? '')
      .neq('estado', 'arquivado'),

    supabase
      .from('product_alerts')
      .select('id, mensagem, severidade, tipo, created_at, products(nome_comercial)')
      .eq('resolvido', false)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('seasonal_events')
      .select('id, nome, data_inicio, data_fim, tipo')
      .gte('data_inicio', new Date().toISOString().split('T')[0])
      .order('data_inicio', { ascending: true })
      .limit(5),
  ])

  const products = productsResult.data ?? []
  const alerts = alertsResult.data ?? []
  const events = eventsResult.data ?? []

  const totalProducts = products.length
  const avgScore = totalProducts > 0
    ? Math.round(products.reduce((sum, p) => sum + (p.score_qualidade ?? 0), 0) / totalProducts)
    : 0
  const criticalAlerts = alerts.filter((a) => a.severidade === 'critico').length
  const healthyProducts = products.filter((p) => (p.score_qualidade ?? 0) >= 75).length

  const orgName = (member?.organizations as { name?: string } | null)?.name ?? 'Minha organização'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{orgName}</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {totalProducts === 0
              ? 'Comece adicionando seus primeiros produtos'
              : `${totalProducts} produto${totalProducts !== 1 ? 's' : ''} no catálogo`}
          </p>
        </div>
        <Link href="/dashboard/content">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <Plus className="h-4 w-4" /> Novo produto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <StatsCards
        totalProducts={totalProducts}
        avgScore={avgScore}
        criticalAlerts={criticalAlerts}
        healthyProducts={healthyProducts}
      />

      {/* Estado vazio */}
      {totalProducts === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-400 text-sm mb-4">
            Você ainda não tem produtos cadastrados. Adicione seu primeiro produto para começar a otimizar seus listings.
          </p>
          <Link href="/dashboard/content">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
              <Plus className="h-4 w-4" /> Adicionar primeiro produto
            </Button>
          </Link>
        </div>
      )}

      {/* Alertas + Eventos */}
      {totalProducts > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertsFeed alerts={alerts as unknown as Parameters<typeof AlertsFeed>[0]['alerts']} />
          <UpcomingEvents events={events} />
        </div>
      )}
    </div>
  )
}
