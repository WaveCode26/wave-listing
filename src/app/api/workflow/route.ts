import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    if (!member) return NextResponse.json([])

    const { data, error } = await supabase
      .from('workflow_tasks')
      .select(`
        id, titulo, descricao, stage, prioridade, due_date, created_at, updated_at,
        products(id, nome_comercial, sku, score_qualidade)
      `)
      .eq('organization_id', member.organization_id)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

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

    const body = await req.json()
    const { titulo, product_id, prioridade, due_date } = body

    if (!titulo) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })

    const { data, error } = await supabase
      .from('workflow_tasks')
      .insert({
        organization_id: member.organization_id,
        titulo,
        product_id: product_id || null,
        prioridade: prioridade ?? 'media',
        stage: 'backlog',
        due_date: due_date || null,
        criado_por: user.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
