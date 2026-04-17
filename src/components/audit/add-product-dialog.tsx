'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search } from 'lucide-react'

interface AddProductDialogProps {
  open: boolean
  onClose: () => void
  categories: { id: string; name: string }[]
}

export function AddProductDialog({ open, onClose, categories }: AddProductDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [asinLoading, setAsinLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome_comercial: '',
    sku: '',
    asin: '',
    ean: '',
    category_id: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function fetchAsin() {
    const asin = form.asin.trim().toUpperCase()
    if (!asin.match(/^[A-Z0-9]{10}$/)) {
      setError('ASIN deve ter 10 caracteres alfanuméricos')
      return
    }
    setAsinLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/amazon/asin/${asin}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'ASIN não encontrado')
      if (data.nome) setForm(prev => ({ ...prev, nome_comercial: data.nome }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ASIN')
    } finally {
      setAsinLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Erro ao salvar produto')
      setLoading(false)
      return
    }

    setForm({ nome_comercial: '', sku: '', asin: '', ean: '', category_id: '' })
    onClose()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-zinc-300">Nome do produto *</Label>
              <Input
                name="nome_comercial"
                value={form.nome_comercial}
                onChange={handleChange}
                placeholder="Ex: Panela de Pressão Elétrica 5L"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">SKU *</Label>
                <Input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="SKU-001"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">ASIN</Label>
                <div className="flex gap-2">
                  <Input
                    name="asin"
                    value={form.asin}
                    onChange={handleChange}
                    placeholder="B0XXXXXXXX"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={fetchAsin}
                    disabled={asinLoading || !form.asin}
                    className="border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 flex-shrink-0"
                    title="Buscar dados do ASIN na Amazon"
                  >
                    {asinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">EAN / GTIN</Label>
                <Input
                  name="ean"
                  value={form.ean}
                  onChange={handleChange}
                  placeholder="7891234567890"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Categoria</Label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecionar...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
