'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        setError('Este e-mail já está cadastrado.')
      } else if (error.message.includes('invalid')) {
        setError('E-mail inválido.')
      } else {
        setError(`Erro: ${error.message}`)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
          <h2 className="text-white text-lg font-semibold">Verifique seu e-mail</h2>
          <p className="text-zinc-400 text-sm">
            Enviamos um link de confirmação para <strong className="text-zinc-200">{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
            Voltar para o login
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-xl">Criar conta</CardTitle>
        <CardDescription className="text-zinc-400">
          Comece a otimizar seus listings gratuitamente
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-zinc-300">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-300">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-300">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
          </Button>
          <p className="text-sm text-zinc-400 text-center">
            Já tem conta?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
