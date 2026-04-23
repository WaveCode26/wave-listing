import { openai } from './client'
import { anthropic, AI_MODEL } from '@/lib/ai/client'

export type ImageType = 'main' | 'lifestyle' | 'infographic' | 'detail'

interface ProductInfo {
  nome: string
  categoria?: string
  cor?: string
  material?: string
  diferenciais?: string
}

const IMAGE_TYPE_INSTRUCTIONS: Record<ImageType, string> = {
  main: `Imagem principal Amazon: produto isolado em fundo BRANCO puro (#FFFFFF), sem sombra, sem texto, sem props. Produto ocupa 85% do quadro, perfeitamente centrado, iluminação profissional de estúdio, ângulo levemente 3/4 frontal. Estilo foto de catálogo e-commerce de alta qualidade.`,
  lifestyle: `Foto lifestyle Amazon: produto em uso em ambiente real, contexto doméstico ou cotidiano brasileiro. Iluminação natural, cores quentes, atmosfera aconchegante. Pessoa usando ou interagindo com o produto (sem mostrar rosto). Sem texto. Qualidade fotográfica profissional.`,
  infographic: `Foto infográfica Amazon: produto em fundo branco ou cinza claro, com destaque visual para detalhes e características. Ângulo que mostre funcionalidades. Iluminação profissional de estúdio. Composição limpa e técnica. Sem texto sobreposto (será adicionado depois).`,
  detail: `Foto de detalhe/zoom Amazon: close-up extremo em um detalhe específico do produto — textura, material, acabamento, botão, conector, costura. Fundo neutro desfocado (bokeh). Iluminação macro profissional. Realça qualidade e durabilidade.`,
}

/**
 * Step 1: Claude gera o prompt ideal em inglês para o DALL-E
 */
export async function generateImagePrompt(product: ProductInfo, type: ImageType): Promise<string> {
  const typeInstruction = IMAGE_TYPE_INSTRUCTIONS[type]

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Você é especialista em fotografia de produto para Amazon Brasil e prompts para geração de imagem com IA.

Produto: ${product.nome}
Categoria: ${product.categoria ?? 'geral'}
${product.cor ? `Cor: ${product.cor}` : ''}
${product.material ? `Material: ${product.material}` : ''}
${product.diferenciais ? `Diferenciais: ${product.diferenciais}` : ''}

Tipo de imagem desejada: ${typeInstruction}

Crie um prompt em INGLÊS para o DALL-E 3 gerar esta imagem. O prompt deve ser:
- Específico e detalhado (descreva o produto com precisão)
- Seguir os padrões visuais dos top sellers Amazon Brasil
- Incluir estilo fotográfico, iluminação, ângulo, fundo
- Máximo 200 palavras
- Responda APENAS com o prompt, sem explicações`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  return text
}

/**
 * Step 2: DALL-E 3 gera a imagem a partir do prompt
 */
export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
    style: 'natural',
  })

  const url = response.data?.[0]?.url
  if (!url) throw new Error('DALL-E não retornou URL de imagem')
  return url
}

/**
 * Pipeline completo: produto → prompt → imagem
 */
export async function generateProductImage(product: ProductInfo, type: ImageType) {
  const prompt = await generateImagePrompt(product, type)
  const imageUrl = await generateImage(prompt)
  return { prompt, imageUrl }
}
