import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ productId: string }>
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { productId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('content_versions')
    .select('*')
    .eq('product_id', productId)
    .order('versao', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? null)
}

export async function POST(req: Request, { params }: RouteContext) {
  const { productId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { titulo, bullets, descricao, backend_keywords } = body

  // Get current max version
  const { data: latest } = await supabase
    .from('content_versions')
    .select('versao')
    .eq('product_id', productId)
    .order('versao', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextVersion = (latest?.versao ?? 0) + 1

  // Deactivate previous versions
  await supabase
    .from('content_versions')
    .update({ is_active: false })
    .eq('product_id', productId)

  const { data, error } = await supabase
    .from('content_versions')
    .insert({
      product_id: productId,
      versao: nextVersion,
      titulo,
      bullets: bullets ?? [],
      descricao,
      backend_keywords: backend_keywords ?? [],
      is_active: true,
      criado_por: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
