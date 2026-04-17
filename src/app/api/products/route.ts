import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

    const body = await request.json()
    const { nome_comercial, sku, ean, asin, category_id } = body

    if (!nome_comercial || !sku) {
      return NextResponse.json({ error: 'Nome e SKU são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        organization_id: member.organization_id,
        nome_comercial,
        sku,
        ean: ean || null,
        asin: asin || null,
        category_id: category_id || null,
        estado: 'rascunho',
        score_qualidade: 0,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'SKU já cadastrado nesta organização' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: member } = await supabase
      .from('members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!member) return NextResponse.json([], { status: 200 })

    const { data, error } = await supabase
      .from('products')
      .select(`
        id, nome_comercial, sku, asin, estado, score_qualidade, created_at, updated_at,
        categories(name),
        product_alerts(id, severidade, resolvido)
      `)
      .eq('organization_id', member.organization_id)
      .neq('estado', 'arquivado')
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
