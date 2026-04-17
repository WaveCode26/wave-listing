'use client'

import { useState } from 'react'
import { Sparkles, Save, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ContentVersion {
  titulo: string | null
  bullets: string[] | null
  descricao: string | null
  backend_keywords: string[] | null
}

interface Props {
  productId: string
  productName: string
  category: string | null
  initialContent: ContentVersion | null
}

function FieldHeader({
  label,
  hint,
  onGenerate,
  generating,
}: {
  label: string
  hint?: string
  onGenerate: () => void
  generating: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-zinc-300">{label}</Label>
        {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onGenerate}
        disabled={generating}
        className="text-purple-400 hover:text-purple-300 hover:bg-purple-950 gap-1.5 h-7 text-xs"
      >
        {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        Gerar com IA
      </Button>
    </div>
  )
}

export function ContentEditor({ productId, productName, category, initialContent }: Props) {
  const [titulo, setTitulo] = useState(initialContent?.titulo ?? '')
  const [bullets, setBullets] = useState<string[]>(initialContent?.bullets ?? ['', '', '', '', ''])
  const [descricao, setDescricao] = useState(initialContent?.descricao ?? '')
  const [keywords, setKeywords] = useState<string[]>(initialContent?.backend_keywords ?? [])
  const [keywordInput, setKeywordInput] = useState('')

  const [generating, setGenerating] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate(field: string) {
    setGenerating(prev => ({ ...prev, [field]: true }))
    try {
      const res = await fetch(`/api/content/${productId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          context: {
            nome_comercial: productName,
            category,
            existing_titulo: titulo || undefined,
            existing_bullets: bullets.filter(Boolean).length > 0 ? bullets.filter(Boolean) : undefined,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro na geração')

      if (field === 'titulo') setTitulo(data.result)
      else if (field === 'bullets') setBullets(data.result)
      else if (field === 'descricao') setDescricao(data.result)
      else if (field === 'backend_keywords') setKeywords(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar conteúdo')
    } finally {
      setGenerating(prev => ({ ...prev, [field]: false }))
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/content/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo || null,
          bullets: bullets.filter(Boolean),
          descricao: descricao || null,
          backend_keywords: keywords,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function updateBullet(index: number, value: string) {
    setBullets(prev => prev.map((b, i) => i === index ? value : b))
  }

  function addBullet() {
    if (bullets.length < 7) setBullets(prev => [...prev, ''])
  }

  function removeBullet(index: number) {
    if (bullets.length > 1) setBullets(prev => prev.filter((_, i) => i !== index))
  }

  function addKeyword() {
    const kw = keywordInput.trim().toLowerCase()
    if (kw && !keywords.includes(kw)) {
      setKeywords(prev => [...prev, kw])
    }
    setKeywordInput('')
  }

  const keywordBytes = keywords.join(' ').length

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Título */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <FieldHeader
          label="Título"
          hint={`${titulo.length}/200 caracteres`}
          onGenerate={() => generate('titulo')}
          generating={!!generating['titulo']}
        />
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título otimizado para Amazon..."
          maxLength={200}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
        />
      </div>

      {/* Bullets */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <FieldHeader
          label="Bullet Points"
          hint={`${bullets.filter(Boolean).length}/7 bullets`}
          onGenerate={() => generate('bullets')}
          generating={!!generating['bullets']}
        />
        <div className="space-y-2">
          {bullets.map((bullet, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex-shrink-0 w-5 text-xs text-zinc-600 mt-2.5 text-right">{i + 1}</span>
              <Input
                value={bullet}
                onChange={(e) => updateBullet(i, e.target.value)}
                placeholder={`Bullet ${i + 1}...`}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBullet(i)}
                disabled={bullets.length <= 1}
                className="flex-shrink-0 text-zinc-600 hover:text-red-400 h-9 w-9"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        {bullets.length < 7 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addBullet}
            className="text-zinc-400 hover:text-white gap-1.5 h-7 text-xs"
          >
            <Plus className="h-3 w-3" /> Adicionar bullet
          </Button>
        )}
      </div>

      {/* Descrição */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <FieldHeader
          label="Descrição"
          hint={`${descricao.length} caracteres (suporta HTML básico)`}
          onGenerate={() => generate('descricao')}
          generating={!!generating['descricao']}
        />
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição detalhada do produto..."
          rows={8}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none resize-none"
        />
      </div>

      {/* Backend Keywords */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <FieldHeader
          label="Backend Keywords"
          hint={`${keywordBytes}/250 bytes`}
          onGenerate={() => generate('backend_keywords')}
          generating={!!generating['backend_keywords']}
        />
        <div className="flex gap-2">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
            placeholder="Digite uma keyword e pressione Enter..."
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
          />
          <Button type="button" variant="ghost" size="sm" onClick={addKeyword} className="text-zinc-400 border border-zinc-700 hover:text-white hover:bg-zinc-800">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-full"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => setKeywords(prev => prev.filter((_, j) => j !== i))}
                  className="text-zinc-500 hover:text-red-400 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className={`text-xs ${keywordBytes > 250 ? 'text-red-400' : 'text-zinc-600'}`}>
          {keywordBytes}/250 bytes utilizados
        </p>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pb-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4" /> Salvo com sucesso!
          </span>
        )}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar versão
        </Button>
      </div>
    </div>
  )
}
