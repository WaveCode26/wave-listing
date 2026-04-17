import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ taskId: string }>
}

const VALID_STAGES = ['backlog', 'em_criacao', 'revisao', 'aprovacao', 'publicado']

export async function PATCH(req: Request, { params }: RouteContext) {
  const { taskId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { stage } = body

  if (stage && !VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Stage inválido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('workflow_tasks')
    .update({ stage })
    .eq('id', taskId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { taskId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { error } = await supabase.from('workflow_tasks').delete().eq('id', taskId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
