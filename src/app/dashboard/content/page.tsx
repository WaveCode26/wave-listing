'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Search, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { ScoreBadge } from '@/components/shared/score-badge'

interface Product {
  id: string
  nome_comercial: string
  sku: string
  score_qualidade: number
  content_versions: { is_active: boolean; titulo: string | null }[]
}

export default function ContentPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/products/content-list')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setProducts(data); setLoading(false) })
  }, [])

  const filtered = products.filter(p =>
    p.nome_comercial.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Studio</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Edite e gere listings com IA para cada produto</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-600"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-52" />
              <div className="h-4 bg-zinc-800 rounded w-24 ml-auto" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          description={search ? 'Tente outros termos.' : 'Adicione produtos na Auditoria primeiro.'}
          action={!search ? (
            <Link href="/dashboard/audit" className="text-sm text-blue-400 hover:text-blue-300">
              Ir para Auditoria →
            </Link>
          ) : undefined}
        />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-3 grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
            <span>Produto</span>
            <span>Conteúdo</span>
            <span>Score</span>
            <span />
          </div>
          <div className="divide-y divide-zinc-800/50">
            {filtered.map((product) => {
              const active = product.content_versions?.find(v => v.is_active)
              const hasContent = !!active?.titulo
              return (
                <Link
                  key={product.id}
                  href={`/dashboard/content/${product.id}`}
                  className="px-5 py-4 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center hover:bg-zinc-800/40 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {product.nome_comercial}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">SKU: {product.sku}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {hasContent
                      ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /><span className="text-green-400">Preenchido</span></>
                      : <><AlertCircle className="h-3.5 w-3.5 text-zinc-500" /><span className="text-zinc-500">Vazio</span></>
                    }
                  </div>

                  <ScoreBadge score={product.score_qualidade} size="sm" />

                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
