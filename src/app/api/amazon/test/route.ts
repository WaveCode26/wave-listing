import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMarketplaceParticipations } from '@/lib/amazon/sellers'
import { MARKETPLACE_ID } from '@/lib/amazon/client'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const res = await getMarketplaceParticipations()
    const br = res.payload.find(p => p.marketplace.id === MARKETPLACE_ID)

    return NextResponse.json({
      ok: true,
      marketplaces: res.payload.map(p => ({
        id: p.marketplace.id,
        name: p.marketplace.name,
        country: p.marketplace.countryCode,
        participating: p.participation.isParticipating,
        suspendedListings: p.participation.hasSuspendedListings,
      })),
      brazil: br ?? null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
