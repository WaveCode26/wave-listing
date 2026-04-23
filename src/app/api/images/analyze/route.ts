import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, AI_MODEL } from '@/lib/ai/client'

/**
 * POST /api/images/analyze
 * Recebe uma imagem em base64 e retorna análise do produto via Claude Vision
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { images } = await req.json()
    // images: Array<{ base64: string, mimeType: string }>
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Imagem obrigatória' }, { status: 400 })
    }

    // Monta o conteúdo com todas as imagens + instrução no final
    const content: Parameters<typeof anthropic.messages.create>[0]['messages'][0]['content'] = [
      ...images.map((img: { base64: string; mimeType: string }) => ({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: (img.mimeType ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: img.base64,
        },
      })),
      {
        type: 'text' as const,
        text: `Analise ${images.length > 1 ? `essas ${images.length} fotos do mesmo produto` : 'esta foto do produto'} para venda na Amazon Brasil. Use todas as imagens para ter uma visão completa. Retorne APENAS um JSON válido com estes campos:
{
  "nome": "nome descritivo e completo do produto",
  "categoria": "categoria Amazon mais adequada",
  "cor": "cor principal do produto",
  "material": "material principal aparente",
  "diferenciais": "características visuais notáveis separadas por vírgula"
}
Seja específico e preciso. Responda APENAS o JSON, sem explicações.`,
      },
    ]

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      messages: [{ role: 'user', content }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json(analysis)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao analisar imagem'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
