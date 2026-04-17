'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, RefreshCw, ChevronRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScoreBadge } from '@/components/shared/score-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { AddProductDialog } from '@/components/audit/add-product-dialog'

interface Category {
  id: string
  name: string
}

interface Alert {
  id: string
  severidade: string
  resolvido: boolean
}

interface Product {
  id: string
  nome_comercial: string
  sku: string
  asin: string | null
  estado: string
  score_qualidade: number
  updated_at: string
  categories: { name: string } | null
  product_alerts: Alert[]
}

const ESTADO_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  em_revisao: 'Em revisão',
  publicado: 'Publicado',
  arquivado: 'Arquivado',
}

const ESTADO_COLORS: Record<string, string> = {
  rascunho: 'bg-zinc-800 text-zinc-400',
  em_revisao: 'bg-yellow-950 text-yellow-400',
  publicado: 'bg-green-950 text-green-400',
  arquivado: 'bg-zinc-900 text-zinc-600',
}

export default function AuditPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/products')
    if (res.ok) {
      const data = await res.json()
      setProducts(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
    fetch('/api/categories').then(r => r.ok ? r.json() : []).then(setCategories)
  }, [fetchProducts])

  const filtered = products.filter(p =>
    p.nome_comercial.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.asin ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function criticalAlerts(product: Product) {
    return product.product_alerts.filter(a => !a.resolvido && a.severidade === 'critico').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Auditoria</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Score de qualidade de todos os seus listings</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
        >
          <Plus className="h-4 w-4" /> Adicionar produto
        </Button>
      </div>

      {/* Search & Refresh */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nome, SKU ou ASIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-600"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchProducts}
          className="text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-48" />
              <div className="h-4 bg-zinc-800 rounded w-24 ml-auto" />
              <div className="h-6 bg-zinc-800 rounded-full w-20" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          description={search ? 'Tente outros termos de busca.' : 'Adicione seu primeiro produto para começar a auditoria.'}
          action={!search ? (
            <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
              <Plus className="h-4 w-4" /> Adicionar produto
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-3 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
            <span>Produto</span>
            <span className="text-right">Score</span>
            <span className="text-right">Estado</span>
            <span className="text-right">Alertas</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-zinc-800/50">
            {filtered.map((product) => {
              const critCount = criticalAlerts(product)
              const totalAlerts = product.product_alerts.filter(a => !a.resolvido).length
              return (
                <Link
                  key={product.id}
                  href={`/dashboard/audit/${product.id}`}
                  className="px-5 py-4 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center hover:bg-zinc-800/40 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {product.nome_comercial}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500">SKU: {product.sku}</span>
                      {product.asin && (
                        <span className="text-xs text-zinc-600">· ASIN: {product.asin}</span>
                      )}
                      {product.categories && (
                        <span className="text-xs text-zinc-600">· {product.categories.name}</span>
                      )}
                    </div>
                  </div>

                  <ScoreBadge score={product.score_qualidade} size="sm" />

                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_COLORS[product.estado] ?? 'bg-zinc-800 text-zinc-400'}`}>
                    {ESTADO_LABELS[product.estado] ?? product.estado}
                  </span>

                  <div className="flex items-center justify-end gap-1">
                    {critCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        {critCount}
                      </span>
                    )}
                    {totalAlerts > critCount && (
                      <span className="text-xs text-zinc-500">{totalAlerts - critCount > 0 ? `+${totalAlerts - critCount}` : ''}</span>
                    )}
                    {totalAlerts === 0 && (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-xs text-zinc-600">
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
          {search && ` encontrado${filtered.length !== 1 ? 's' : ''}`}
        </p>
      )}

      <AddProductDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          fetchProducts()
        }}
        categories={categories}
      />
    </div>
  )
}
