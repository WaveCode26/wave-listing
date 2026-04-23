'use client'

import { useState } from 'react'
import { Sparkles, Download, RefreshCw, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ImageType = 'main' | 'lifestyle' | 'infographic' | 'detail'

const IMAGE_TYPES: { id: ImageType; label: string; description: string; emoji: string }[] = [
  { id: 'main', label: 'Principal', description: 'Fundo branco, produto centralizado — imagem obrigatória Amazon', emoji: '⬜' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Produto em uso no dia a dia, ambiente real', emoji: '🏠' },
  { id: 'infographic', label: 'Infográfico', description: 'Destaque de funcionalidades e detalhes técnicos', emoji: '📊' },
  { id: 'detail', label: 'Detalhe', description: 'Close-up em textura, material ou acabamento', emoji: '🔍' },
]

interface GeneratedImage {
  type: ImageType
  prompt: string
  imageUrl: string
}

export default function ImagesPage() {
  const [form, setForm] = useState({
    nome: '',
    categoria: '',
    cor: '',
    material: '',
    diferenciais: '',
  })
  const [selectedType, setSelectedType] = useState<ImageType>('main')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeneratedImage[]>([])
  const [showPrompt, setShowPrompt] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
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

      setResults(prev => [{ type: selectedType, prompt: data.prompt, imageUrl: data.imageUrl }, ...prev])
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
    a.download = `${form.nome.replace(/\s+/g, '_')}_${type}.png`
    a.click()
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Imagens com IA</h1>
        <p className="text-zinc-400 text-sm mt-0.5">
          Claude cria o prompt ideal → DALL-E 3 gera a imagem → pronto para subir na Amazon
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Dados do produto</h2>

            <div className="space-y-1.5">
              <Label className="text-zinc-300">Nome do produto *</Label>
              <Input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Panela de Pressão Elétrica 5L Inox"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Categoria</Label>
                <Input
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  placeholder="Ex: Cozinha"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Cor</Label>
                <Input
                  name="cor"
                  value={form.cor}
                  onChange={handleChange}
                  placeholder="Ex: Preto fosco"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300">Material</Label>
              <Input
                name="material"
                value={form.material}
                onChange={handleChange}
                placeholder="Ex: Aço inoxidável 304"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300">Diferenciais</Label>
              <textarea
                name="diferenciais"
                value={form.diferenciais}
                onChange={handleChange}
                placeholder="Ex: Tampa de pressão dupla, display digital, 12 funções programáveis"
                rows={3}
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
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !form.nome.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2 h-11"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando... pode levar 20-30s</>
              : <><Sparkles className="h-4 w-4" /> Gerar imagem com IA</>
            }
          </Button>

          <p className="text-xs text-zinc-600 text-center">
            Custo estimado por imagem: ~R$0,20 · Qualidade HD · 1024×1024px
          </p>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          {loading && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 aspect-square flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Sparkles className="h-10 w-10 text-blue-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-300 font-medium">Claude está criando o prompt...</p>
                <p className="text-xs text-zinc-500 mt-1">DALL-E 3 vai gerar a imagem em seguida</p>
              </div>
            </div>
          )}

          {results.length === 0 && !loading && (
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 aspect-square flex flex-col items-center justify-center gap-3 text-center p-8">
              <ImagePlus className="h-10 w-10 text-zinc-600" />
              <p className="text-zinc-400 text-sm">Preencha os dados do produto e clique em Gerar</p>
              <p className="text-zinc-600 text-xs">A imagem aparecerá aqui pronta para download</p>
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
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                      {typeInfo?.emoji} {typeInfo?.label}
                    </span>
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
