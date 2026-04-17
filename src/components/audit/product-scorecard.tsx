'use client'

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Info, ImageIcon, FileText, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Alert {
  id: string
  tipo: string
  severidade: string
  mensagem: string
  resolvido: boolean
  created_at: string
}

interface ContentVersion {
  id: string
  versao: number
  titulo: string | null
  bullets: string[] | null
  descricao: string | null
  backend_keywords: string[] | null
  is_active: boolean
}

interface ProductImage {
  id: string
  tipo: string
  url: string | null
  ordem: number
  score_imagem: number | null
}

interface Props {
  product: { id: string; score_qualidade: number; estado: string }
  activeContent: ContentVersion | undefined
  images: ProductImage[]
  alerts: Alert[]
  criticalCount: number
}

const SEVERIDADE_CONFIG = {
  critico: { color: 'text-red-400', bg: 'bg-red-950 border-red-800', icon: AlertTriangle },
  alto: { color: 'text-orange-400', bg: 'bg-orange-950 border-orange-800', icon: AlertTriangle },
  medio: { color: 'text-yellow-400', bg: 'bg-yellow-950 border-yellow-800', icon: Info },
  baixo: { color: 'text-blue-400', bg: 'bg-blue-950 border-blue-800', icon: Info },
}

function ScoreBar({ label, value, max = 100, weight }: { label: string; value: number; max?: number; weight: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const color = pct >= 90 ? 'bg-green-500' : pct >= 75 ? 'bg-blue-500' : pct >= 55 ? 'bg-yellow-500' : pct >= 35 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{weight} do score</span>
          <span className="text-white font-medium tabular-nums">{value}</span>
        </div>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function ProductScorecard({ product, activeContent, images, alerts, criticalCount }: Props) {
  const hasTitle = !!activeContent?.titulo
  const hasBullets = (activeContent?.bullets?.length ?? 0) >= 5
  const hasDescription = !!activeContent?.descricao
  const hasKeywords = (activeContent?.backend_keywords?.length ?? 0) > 0
  const mainImageCount = images.filter(i => i.tipo === 'principal' || i.tipo === 'galeria').length

  // Rough sub-scores
  const imageScore = Math.min(100, mainImageCount * 14)
  const contentScore = [hasTitle, hasBullets, hasDescription, hasKeywords].filter(Boolean).length * 25

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left column — Score breakdown */}
      <div className="lg:col-span-2 space-y-4">
        {/* Score breakdown card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Composição do Score</h2>
          <ScoreBar label="Imagens" value={imageScore} weight="40%" />
          <ScoreBar label="Conteúdo" value={contentScore} weight="60%" />
          <div className="pt-2 border-t border-zinc-800">
            <ScoreBar label="Score total" value={product.score_qualidade} weight="100%" />
          </div>
        </div>

        {/* Content checklist */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Checklist de Conteúdo</h2>
            <Link href={`/dashboard/content?product=${product.id}`}>
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 gap-1.5 h-7 text-xs">
                <Edit2 className="h-3 w-3" /> Editar conteúdo
              </Button>
            </Link>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Título presente', ok: hasTitle },
              { label: '5+ bullet points', ok: hasBullets },
              { label: 'Descrição preenchida', ok: hasDescription },
              { label: 'Backend keywords', ok: hasKeywords },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                {item.ok
                  ? <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  : <AlertTriangle className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                }
                <span className={`text-sm ${item.ok ? 'text-zinc-300' : 'text-zinc-500'}`}>{item.label}</span>
              </div>
            ))}
          </div>

          {activeContent?.titulo && (
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Título atual</p>
              <p className="text-sm text-zinc-300">{activeContent.titulo}</p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Imagens ({images.length})</h2>
            <ImageIcon className="h-4 w-4 text-zinc-600" />
          </div>
          {images.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhuma imagem cadastrada.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div key={img.id} className="w-16 h-16 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {img.url
                    ? <img src={img.url} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon className="h-6 w-6 text-zinc-600" />
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right column — Alerts */}
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Alertas ativos</h2>
            {criticalCount > 0 && (
              <span className="text-xs text-red-400 font-medium">{criticalCount} crítico{criticalCount !== 1 ? 's' : ''}</span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <p className="text-sm text-zinc-400">Nenhum alerta ativo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const cfg = SEVERIDADE_CONFIG[alert.severidade as keyof typeof SEVERIDADE_CONFIG] ?? SEVERIDADE_CONFIG.baixo
                const Icon = cfg.icon
                return (
                  <div key={alert.id} className={`rounded-lg border p-3 ${cfg.bg}`}>
                    <div className="flex items-start gap-2">
                      <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                      <p className={`text-xs leading-relaxed ${cfg.color}`}>{alert.mensagem}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Estado */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-3">Estado do produto</h2>
          <span className={`text-sm px-3 py-1.5 rounded-full font-medium inline-block ${
            product.estado === 'publicado' ? 'bg-green-950 text-green-400' :
            product.estado === 'em_revisao' ? 'bg-yellow-950 text-yellow-400' :
            'bg-zinc-800 text-zinc-400'
          }`}>
            {product.estado === 'publicado' ? 'Publicado' :
             product.estado === 'em_revisao' ? 'Em revisão' :
             product.estado === 'rascunho' ? 'Rascunho' : product.estado}
          </span>
        </div>
      </div>
    </div>
  )
}
