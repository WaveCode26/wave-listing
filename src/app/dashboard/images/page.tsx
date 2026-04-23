'use client'

import { useState, useRef } from 'react'
import { Sparkles, Download, ImagePlus, Loader2, Upload, X, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type ImageType = 'main' | 'lifestyle' | 'infographic' | 'detail'

const IMAGE_TYPES: { id: ImageType; label: string; description: string; emoji: string }[] = [
  { id: 'main', label: 'Principal', description: 'Fundo branco obrigatório Amazon', emoji: '⬜' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Produto em uso, ambiente real', emoji: '🏠' },
  { id: 'infographic', label: 'Infográfico', description: 'Detalhes e funcionalidades', emoji: '📊' },
  { id: 'detail', label: 'Detalhe', description: 'Close-up em textura ou material', emoji: '🔍' },
]

const CATEGORIAS = [
  'Casa e Cozinha', 'Eletrônicos', 'Esportes e Aventura', 'Beleza e Cuidado Pessoal',
  'Ferramentas e Construção', 'Brinquedos e Jogos', 'Moda e Acessórios', 'Automotivo',
  'Saúde', 'Pet Shop', 'Informática', 'Jardim', 'Bebê', 'Alimentos e Bebidas', 'Outro',
]

const CORES = [
  'Preto', 'Branco', 'Prata', 'Cinza', 'Azul', 'Azul marinho', 'Vermelho', 'Verde',
  'Amarelo', 'Rosa', 'Roxo', 'Laranja', 'Dourado', 'Bronze', 'Bege', 'Transparente',
  'Multicolorido', 'Outra',
]

const MATERIAIS = [
  'Aço inoxidável', 'Alumínio', 'Plástico ABS', 'Polipropileno', 'Silicone',
  'Madeira', 'Vidro temperado', 'Cerâmica', 'Couro', 'Couro sintético',
  'Tecido poliéster', 'Nylon', 'Borracha', 'Fibra de carbono', 'Inox + Plástico', 'Outro',
]

interface FormState {
  nome: string
  categoria: string
  cor: string
  material: string
  diferenciais: string
}

interface GeneratedImage {
  type: ImageType
  prompt: string
  imageUrl: string
  usedFallback?: boolean
}

export default function ImagesPage() {
  const [form, setForm] = useState<FormState>({
    nome: '', categoria: '', cor: '', material: '', diferenciais: '',
  })
  const [selectedType, setSelectedType] = useState<ImageType>('main')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeneratedImage[]>([])
  const [showPrompt, setShowPrompt] = useState<string | null>(null)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSelect(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAnalyzing(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setUploadedPhoto(dataUrl)

      // Extrai base64 puro
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type

      try {
        const res = await fetch('/api/images/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Erro na análise')

        setForm(prev => ({
          nome: data.nome || prev.nome,
          categoria: data.categoria || prev.categoria,
          cor: data.cor || prev.cor,
          material: data.material || prev.material,
          diferenciais: data.diferenciais || prev.diferenciais,
        }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao analisar foto')
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleGenerate() {
    if (!form.nome.trim()) {
      setError('Nome do produto é obrigatório')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tipo: selectedType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar imagem')
      setResults(prev => [{ type: selectedType, prompt: data.prompt, imageUrl: data.imageUrl, usedFallback: data.usedFallback }, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(url: string, type: ImageType) {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${form.nome.replace(/\s+/g, '_') || 'produto'}_${type}.png`
    a.click()
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Imagens com IA</h1>
        <p className="text-zinc-400 text-sm mt-0.5">
          Suba uma foto do produto ou preencha os campos — geramos imagens prontas para Amazon
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna esquerda — formulário */}
        <div className="space-y-4">

          {/* Upload de foto */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Foto do produto</h2>
              <span className="text-xs text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full">Claude Vision</span>
            </div>
            <p className="text-xs text-zinc-500">Suba uma foto real do seu produto — Claude analisa e preenche os campos automaticamente</p>

            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />

            {uploadedPhoto ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uploadedPhoto} alt="Produto" className="w-full h-40 object-contain rounded-lg bg-zinc-800" />
                <button
                  onClick={() => { setUploadedPhoto(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-2 right-2 bg-zinc-900 border border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
                {analyzing && (
                  <div className="absolute inset-0 bg-zinc-900/80 rounded-lg flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                    <span className="text-sm text-purple-300">Claude analisando...</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-zinc-500 transition-colors"
              >
                <Upload className="h-6 w-6 text-zinc-500" />
                <span className="text-sm text-zinc-400">Clique para subir foto</span>
                <span className="text-xs text-zinc-600">JPG, PNG ou WEBP</span>
              </button>
            )}
          </div>

          {/* Dados do produto */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Dados do produto</h2>

            {/* Nome */}
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Nome do produto *</Label>
              <input
                value={form.nome}
                onChange={e => handleSelect('nome', e.target.value)}
                placeholder="Ex: Panela de Pressão Elétrica 5L Inox"
                className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Categoria</Label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleSelect('categoria', cat)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      form.categoria === cat
                        ? 'border-blue-500 bg-blue-950 text-blue-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Cor principal</Label>
              <div className="flex flex-wrap gap-1.5">
                {CORES.map(cor => (
                  <button
                    key={cor}
                    onClick={() => handleSelect('cor', cor)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      form.cor === cor
                        ? 'border-blue-500 bg-blue-950 text-blue-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {cor}
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Material</Label>
              <div className="flex flex-wrap gap-1.5">
                {MATERIAIS.map(mat => (
                  <button
                    key={mat}
                    onClick={() => handleSelect('material', mat)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      form.material === mat
                        ? 'border-blue-500 bg-blue-950 text-blue-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* Diferenciais */}
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Diferenciais <span className="text-zinc-600">(opcional)</span></Label>
              <textarea
                value={form.diferenciais}
                onChange={e => handleSelect('diferenciais', e.target.value)}
                placeholder="Ex: Tampa dupla pressão, display digital, 12 funções"
                rows={2}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Tipo de imagem */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Tipo de imagem</h2>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedType === type.id
                      ? 'border-blue-500 bg-blue-950/50'
                      : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                  }`}
                >
                  <div className="text-lg mb-1">{type.emoji}</div>
                  <div className="text-sm font-medium text-white">{type.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5 leading-tight">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 flex items-start justify-between gap-2">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300 flex-shrink-0">×</button>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !form.nome.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2 h-11"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando... aguarde ~20s</>
              : <><Wand2 className="h-4 w-4" /> Gerar imagem</>
            }
          </Button>

          <p className="text-xs text-zinc-600 text-center">~R$0,20 por imagem · HD 1024×1024px · direito comercial incluído</p>
        </div>

        {/* Coluna direita — resultados */}
        <div className="space-y-4">
          {loading && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 aspect-square flex flex-col items-center justify-center gap-4">
              <Sparkles className="h-10 w-10 text-blue-400 animate-pulse" />
              <div className="text-center">
                <p className="text-sm text-zinc-300 font-medium">Gerando prompt e imagem...</p>
                <p className="text-xs text-zinc-500 mt-1">DALL-E 3 · qualidade HD</p>
              </div>
            </div>
          )}

          {results.length === 0 && !loading && (
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 aspect-square flex flex-col items-center justify-center gap-3 text-center p-8">
              <ImagePlus className="h-10 w-10 text-zinc-600" />
              <p className="text-zinc-400 text-sm">Sua imagem aparecerá aqui</p>
              <p className="text-zinc-600 text-xs">Preencha os dados ou suba uma foto do produto</p>
            </div>
          )}

          {results.map((result, i) => {
            const typeInfo = IMAGE_TYPES.find(t => t.id === result.type)
            return (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.imageUrl}
                  alt={`${form.nome} - ${typeInfo?.label}`}
                  className="w-full aspect-square object-contain bg-white"
                />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                        {typeInfo?.emoji} {typeInfo?.label}
                      </span>
                      {result.usedFallback && (
                        <span className="text-xs text-yellow-600 bg-yellow-950 px-1.5 py-0.5 rounded">prompt direto</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPrompt(showPrompt === result.prompt ? null : result.prompt)}
                        className="text-zinc-500 hover:text-zinc-300 h-7 text-xs"
                      >
                        Ver prompt
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(result.imageUrl, result.type)}
                        className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5 h-7 text-xs"
                      >
                        <Download className="h-3 w-3" /> Baixar
                      </Button>
                    </div>
                  </div>
                  {showPrompt === result.prompt && (
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-xs text-zinc-400 leading-relaxed">{result.prompt}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
