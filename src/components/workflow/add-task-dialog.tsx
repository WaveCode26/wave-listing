'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface Product {
  id: string
  nome_comercial: string
  sku: string
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (task: unknown) => void
}

export function AddTaskDialog({ open, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    titulo: '',
    product_id: '',
    prioridade: 'media',
    due_date: '',
  })

  useEffect(() => {
    if (open) {
      fetch('/api/products/content-list')
        .then(r => r.ok ? r.json() : [])
        .then(setProducts)
    }
  }, [open])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo,
        product_id: form.product_id || null,
        prioridade: form.prioridade,
        due_date: form.due_date || null,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Erro ao criar tarefa')
      setLoading(false)
      return
    }

    setForm({ titulo: '', product_id: '', prioridade: 'media', due_date: '' })
    onCreated(data)
    onClose()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Nova tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-zinc-300">Título *</Label>
              <Input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ex: Otimizar título para Black Friday"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300">Produto vinculado</Label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Nenhum</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.nome_comercial} — {p.sku}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Prioridade</Label>
                <select
                  name="prioridade"
                  value={form.prioridade}
                  onChange={handleChange}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Prazo</Label>
                <Input
                  name="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
