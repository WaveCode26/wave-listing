import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ScoreBadge } from '@/components/shared/score-badge'
import { ArrowLeft, AlertTriangle, CheckCircle2, Info, Package, Tag, Barcode, Hash } from 'lucide-react'
import { ProductScorecard } from '@/components/audit/product-scorecard'

interface PageProps {
  params: Promise<{ productId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('nome_comercial').eq('id', productId).single()
  return { title: data ? `${data.nome_comercial} — Auditoria` : 'Produto' }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      product_alerts(id, tipo, severidade, mensagem, resolvido, created_at),
      content_versions(id, versao, titulo, bullets, descricao, backend_keywords, created_at, is_active),
      product_images(id, tipo, url, ordem, score_imagem)
    `)
    .eq('id', productId)
    .single()

  if (error || !product) notFound()

  const activeAlerts = (product.product_alerts ?? []).filter((a: { resolvido: boolean }) => !a.resolvido)
  const criticalCount = activeAlerts.filter((a: { severidade: string }) => a.severidade === 'critico').length
  const activeContent = (product.content_versions ?? []).find((v: { is_active: boolean }) => v.is_active)
  const images = product.product_images ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/audit"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Auditoria
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{product.nome_comercial}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Hash className="h-3 w-3" /> SKU: {product.sku}
            </span>
            {product.asin && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Barcode className="h-3 w-3" /> ASIN: {product.asin}
              </span>
            )}
            {product.ean && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Tag className="h-3 w-3" /> EAN: {product.ean}
              </span>
            )}
            {product.categories && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Package className="h-3 w-3" /> {product.categories.name}
              </span>
            )}
          </div>
        </div>
        <ScoreBadge score={product.score_qualidade} size="lg" />
      </div>

      {/* Scorecard component */}
      <ProductScorecard
        product={product}
        activeContent={activeContent}
        images={images}
        alerts={activeAlerts}
        criticalCount={criticalCount}
      />
    </div>
  )
}
