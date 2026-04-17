import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/ai/client'

interface RouteContext {
  params: Promise<{ productId: string }>
}

export async function POST(req: Request, { params }: RouteContext) {
  const { productId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { field, context } = await req.json()
  // field: 'titulo' | 'bullets' | 'descricao' | 'backend_keywords'
  // context: { nome_comercial, sku, asin, category, existing_titulo?, existing_bullets? }

  const { nome_comercial, category, existing_titulo, existing_bullets } = context

  const prompts: Record<string, string> = {
    titulo: `Você é especialista em Amazon Brasil. Crie um título otimizado para Amazon.com.br.

Produto: ${nome_comercial}
Categoria: ${category ?? 'Geral'}

Regras obrigatórias:
- Máximo 200 caracteres
- Inclua marca (se conhecida), modelo, material, cor, tamanho quando relevante
- Use palavras-chave de alta busca para Amazon BR
- Formato: [Marca] + [Produto] + [Características principais] + [Benefício]
- Não use emojis, pipes ou caracteres especiais
- Responda APENAS com o título, sem explicações`,

    bullets: `Você é especialista em Amazon Brasil. Crie 7 bullet points para o produto.

Produto: ${nome_comercial}
Categoria: ${category ?? 'Geral'}
Título: ${existing_titulo ?? nome_comercial}

Regras:
- Exatamente 7 bullets
- Cada bullet começa com palavras em MAIÚSCULAS (ex: "FÁCIL DE USAR —")
- Destaque benefício principal, não só característica
- Máximo 250 caracteres por bullet
- Use palavras-chave relevantes para buscas no Amazon BR
- Foque no comprador brasileiro
- Responda APENAS com os 7 bullets, um por linha, sem numeração`,

    descricao: `Você é especialista em Amazon Brasil. Crie uma descrição HTML para o produto.

Produto: ${nome_comercial}
Categoria: ${category ?? 'Geral'}
Título: ${existing_titulo ?? nome_comercial}
Bullets: ${existing_bullets ? existing_bullets.join('\n') : '(não disponíveis)'}

Regras:
- Entre 500 e 2000 caracteres
- Pode usar <br>, <b>, <p> (Amazon suporta HTML básico)
- Conte uma história do produto, foco em benefícios para o comprador
- Inclua usos, público-alvo, diferenciais
- Termine com chamada para ação
- Responda APENAS com o HTML da descrição`,

    backend_keywords: `Você é especialista em Amazon Brasil. Gere backend keywords para o produto.

Produto: ${nome_comercial}
Categoria: ${category ?? 'Geral'}

Regras:
- Máximo 250 bytes no total
- Palavras separadas por espaço (sem vírgulas)
- Inclua variações, sinônimos, termos em português
- Não repita palavras já no título
- Não inclua marca concorrente
- Foque em termos de busca que compradores brasileiros usam
- Responda APENAS com as keywords separadas por espaço`,
  }

  const prompt = prompts[field]
  if (!prompt) return NextResponse.json({ error: 'Campo inválido' }, { status: 400 })

  try {
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    if (field === 'bullets') {
      const bullets = text.split('\n').map((b: string) => b.trim()).filter((b: string) => b.length > 0)
      return NextResponse.json({ result: bullets })
    }

    if (field === 'backend_keywords') {
      const keywords = text.split(/\s+/).filter((k: string) => k.length > 0)
      return NextResponse.json({ result: keywords })
    }

    return NextResponse.json({ result: text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao chamar IA'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
