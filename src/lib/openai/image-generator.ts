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

// Variações aleatórias para garantir imagens diferentes a cada geração
const LIFESTYLE_SCENES = [
  'modern Brazilian living room with warm afternoon light',
  'minimalist home office with natural light from window',
  'cozy kitchen counter with soft morning light',
  'outdoor terrace with natural sunlight and plants',
  'contemporary Brazilian apartment, open plan living space',
  'clean workspace with Scandinavian-style decor',
  'bright dining area with wooden table and natural light',
  'modern bedroom with subtle ambient lighting',
]

const LIFESTYLE_ANGLES = [
  'shot from slightly above at 45-degree angle',
  'eye-level shot, straight on',
  'low angle shot looking slightly up',
  'over-the-shoulder perspective',
  'wide establishing shot showing full environment',
  'medium shot with environmental context',
]

const LIFESTYLE_LIGHTING = [
  'warm golden hour sunlight streaming through window',
  'soft diffused natural daylight',
  'bright airy natural light',
  'warm ambient indoor lighting with accent highlights',
  'cool morning light with slight blue tones',
  'dramatic side lighting with warm shadows',
]

const MAIN_ANGLES = [
  'straight front view, perfectly centered',
  'slight 3/4 angle from the right',
  'slight 3/4 angle from the left',
  'top-down flat lay view',
  'slight elevation angle showing top and front',
]

const DETAIL_FOCUSES = [
  'surface texture and material quality',
  'key functional component close-up',
  'finish and craftsmanship details',
  'joint, seam or connection detail',
  'logo, branding or label close-up',
  'most distinctive design feature',
]

const INFOGRAPHIC_ANGLES = [
  'three-quarter exploded view showing components',
  'clean front-facing with shadow to left',
  'elevated angle showing top and front faces',
  'slight dynamic angle with clean light background',
  'symmetrical front view with strong studio lighting',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const IMAGE_TYPE_INSTRUCTIONS: Record<ImageType, () => string> = {
  main: () => `Amazon main product image: product isolated on PURE WHITE background (#FFFFFF), no shadows, no text, no props. Product fills 85% of frame, perfectly centered. Angle: ${pick(MAIN_ANGLES)}. Professional studio lighting, sharp focus, high-end e-commerce catalog quality.`,
  lifestyle: () => `Amazon lifestyle photo: product being used in a ${pick(LIFESTYLE_SCENES)}. ${pick(LIFESTYLE_ANGLES)}. ${pick(LIFESTYLE_LIGHTING)}. Person interacting with product, face not visible. No text overlay. Professional commercial photography quality, editorial aesthetic.`,
  infographic: () => `Amazon product detail photo: ${pick(INFOGRAPHIC_ANGLES)}, light gray or white background, professional studio lighting highlighting product construction and features. Clean technical composition, sharp focus throughout, no text or labels. Suitable for Amazon secondary image slot.`,
  detail: () => `Amazon detail close-up: extreme macro photography focusing on ${pick(DETAIL_FOCUSES)}. Neutral blurred background (bokeh effect). Professional macro studio lighting. Shows material quality, durability and craftsmanship. No text.`,
}

/**
 * Fallback: gera um prompt direto sem Claude quando não há crédito Anthropic
 */
function buildFallbackPrompt(product: ProductInfo, type: ImageType): string {
  const base = `${product.nome}${product.cor ? `, ${product.cor} color` : ''}${product.material ? `, made of ${product.material}` : ''}`
  const extras = product.diferenciais ? `, featuring ${product.diferenciais}` : ''
  const typeInstruction = IMAGE_TYPE_INSTRUCTIONS[type]()

  return `${typeInstruction} Product: ${base}${extras}. High-quality commercial photography, suitable for Amazon Brazil top seller listing.`
}

/**
 * Step 1: Claude gera o prompt ideal em inglês para o DALL-E
 */
export async function generateImagePrompt(product: ProductInfo, type: ImageType): Promise<string> {
  const typeInstruction = IMAGE_TYPE_INSTRUCTIONS[type]

  try {
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
    return text || buildFallbackPrompt(product, type)
  } catch {
    // Fallback quando Anthropic não tem crédito
    return buildFallbackPrompt(product, type)
  }
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
