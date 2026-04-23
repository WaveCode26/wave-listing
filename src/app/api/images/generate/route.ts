import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateProductImage, ImageType } from '@/lib/openai/image-generator'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await req.json()
    const { nome, categoria, cor, material, diferenciais, tipo } = body

    if (!nome) return NextResponse.json({ error: 'Nome do produto obrigatório' }, { status: 400 })

    const validTypes: ImageType[] = ['main', 'lifestyle', 'infographic', 'detail']
    const imageType: ImageType = validTypes.includes(tipo) ? tipo : 'main'

    const result = await generateProductImage(
      { nome, categoria, cor, material, diferenciais },
      imageType
    )

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar imagem'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
