export const SCORING_WEIGHTS = {
  content: 0.60,
  images: 0.40,
} as const

export const CONTENT_SCORES = {
  titulo: 20,
  bullets: 20,
  aplus: 15,
  keywords: 5,
} as const

export const IMAGE_SCORES = {
  quantidade: 10,
  lifestyle: 10,
  infografico: 10,
  escala: 10,
} as const

export const SCORE_LABELS: Record<string, { label: string; color: string }> = {
  excelente: { label: 'Excelente', color: 'text-green-600' },
  bom: { label: 'Bom', color: 'text-blue-600' },
  regular: { label: 'Regular', color: 'text-yellow-600' },
  fraco: { label: 'Fraco', color: 'text-orange-600' },
  critico: { label: 'Crítico', color: 'text-red-600' },
}

export function getScoreLabel(score: number) {
  if (score >= 90) return SCORE_LABELS.excelente
  if (score >= 75) return SCORE_LABELS.bom
  if (score >= 55) return SCORE_LABELS.regular
  if (score >= 35) return SCORE_LABELS.fraco
  return SCORE_LABELS.critico
}
