import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { ContentEditor } from '@/components/content/content-editor'

interface PageProps {
  params: Promise<{ productId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('nome_comercial').eq('id', productId).single()
  return { title: data ? `${data.nome_comercial} — Content Studio` : 'Editor de conteúdo' }
}

export default async function ContentEditorPage({ params }: PageProps) {
  const { productId } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('id, nome_comercial, sku, asin, categories(name)')
    .eq('id', productId)
    .single()

  if (error || !product) notFound()

  const { data: activeContent } = await supabase
    .from('content_versions')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .maybeSingle()

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/dashboard/content"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Content Studio
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">{product.nome_comercial}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">SKU: {product.sku}{product.asin ? ` · ASIN: ${product.asin}` : ''}</p>
      </div>

      <ContentEditor
        productId={productId}
        productName={product.nome_comercial}
        category={(product.categories as unknown as { name: string } | null)?.name ?? null}
        initialContent={activeContent ?? null}
      />
    </div>
  )
}
