import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCatalogItem } from '@/lib/amazon/catalog'

interface RouteContext {
  params: Promise<{ asin: string }>
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { asin } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    if (!asin.match(/^[A-Z0-9]{10}$/)) {
      return NextResponse.json({ error: 'ASIN inválido' }, { status: 400 })
    }

    const item = await getCatalogItem(asin)
    const summary = item.summaries?.[0]
    const images = item.images?.[0]?.images ?? []
    const mainImage = images.find(i => i.variant === 'MAIN')

    return NextResponse.json({
      asin,
      nome: summary?.itemName ?? null,
      marca: summary?.brandName ?? null,
      tipo: item.productTypes?.[0]?.productType ?? null,
      imagem: mainImage?.link ?? null,
      totalImagens: images.length,
      raw: item,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
