import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCatalogItem } from '@/lib/amazon/catalog'
import { getListing, extractIssues } from '@/lib/amazon/listings'

/**
 * POST /api/amazon/sync
 * Body: { seller_id: string } or uses AMAZON_SELLER_ID env var
 *
 * Syncs a single product by ASIN+SKU, or all products in the org
 * that have an ASIN set.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: member } = await supabase
      .from('members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!member) return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const sellerId: string = body.seller_id ?? process.env.AMAZON_SELLER_ID ?? ''

    if (!sellerId) {
      return NextResponse.json({ error: 'seller_id não configurado' }, { status: 400 })
    }

    // Get all products with ASIN in this org
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, sku, asin')
      .eq('organization_id', member.organization_id)
      .not('asin', 'is', null)

    if (prodError) return NextResponse.json({ error: prodError.message }, { status: 500 })
    if (!products || products.length === 0) {
      return NextResponse.json({ synced: 0, message: 'Nenhum produto com ASIN encontrado' })
    }

    const results = {
      synced: 0,
      errors: 0,
      suppressed: 0,
      details: [] as Array<{ sku: string; asin: string; status: string; issues?: number }>,
    }

    for (const product of products) {
      try {
        // Parallel: catalog info + listing status
        const [catalogItem, listing] = await Promise.allSettled([
          getCatalogItem(product.asin!),
          getListing(sellerId, product.sku),
        ])

        const summary = catalogItem.status === 'fulfilled'
          ? catalogItem.value.summaries?.[0]
          : null

        const { suppressed, errors: listingErrors, warnings } = listing.status === 'fulfilled'
          ? extractIssues(listing.value)
          : { suppressed: false, errors: [], warnings: [] }

        const images = catalogItem.status === 'fulfilled'
          ? (catalogItem.value.images?.[0]?.images ?? [])
          : []

        // Upsert product images into product_images table
        if (images.length > 0) {
          const imageRows = images.map((img, i) => ({
            product_id: product.id,
            tipo: img.variant === 'MAIN' ? 'principal' : 'galeria',
            url: img.link,
            ordem: i,
            score_imagem: null,
          }))

          await supabase
            .from('product_images')
            .upsert(imageRows, { onConflict: 'product_id,ordem', ignoreDuplicates: false })
        }

        // Create alerts for suppressed/error listings
        if (suppressed) {
          await supabase.from('product_alerts').upsert({
            product_id: product.id,
            tipo: 'suppressed',
            severidade: 'critico',
            mensagem: 'Listing suprimido na Amazon — verifique conformidade',
            resolvido: false,
          }, { onConflict: 'product_id,tipo', ignoreDuplicates: true })
          results.suppressed++
        }

        for (const issue of listingErrors) {
          await supabase.from('product_alerts').upsert({
            product_id: product.id,
            tipo: issue.code,
            severidade: 'alto',
            mensagem: issue.message,
            resolvido: false,
          }, { onConflict: 'product_id,tipo', ignoreDuplicates: true })
        }

        // Update product name from Amazon if empty
        if (summary?.itemName) {
          await supabase
            .from('products')
            .update({ nome_comercial: summary.itemName })
            .eq('id', product.id)
            .eq('nome_comercial', product.sku) // only if name was never set
        }

        results.synced++
        results.details.push({
          sku: product.sku,
          asin: product.asin!,
          status: suppressed ? 'suppressed' : listingErrors.length > 0 ? 'error' : 'ok',
          issues: listingErrors.length + warnings.length,
        })
      } catch (err) {
        results.errors++
        results.details.push({
          sku: product.sku,
          asin: product.asin!,
          status: 'error',
        })
      }
    }

    return NextResponse.json(results)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
