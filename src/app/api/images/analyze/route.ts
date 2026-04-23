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

    const { imageBase64, mimeType } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'Imagem obrigatória' }, { status: 400 })

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType ?? 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Analise esta imagem de produto para venda na Amazon Brasil. Retorne APENAS um JSON válido com estes campos:
{
  "nome": "nome descritivo do produto",
  "categoria": "categoria Amazon mais adequada",
  "cor": "cor principal do produto",
  "material": "material principal aparente",
  "diferenciais": "características visuais notáveis separadas por vírgula"
}
Seja específico e preciso. Responda APENAS o JSON, sem explicações.`,
          },
        ],
      }],
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
