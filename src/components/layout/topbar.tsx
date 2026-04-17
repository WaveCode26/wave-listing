'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, LogOut, Settings, User } from 'lucide-react'

interface TopbarProps {
  userEmail?: string
}

export function Topbar({ userEmail }: TopbarProps) {
  const router = useRouter()
  const initials = userEmail?.substring(0, 2).toUpperCase() ?? 'WL'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 z-20">
      <div />
      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
              {initials}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800 text-zinc-100" align="end">
            <div className="px-3 py-2">
              <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-zinc-800 gap-2"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-4 w-4" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 gap-2">
              <User className="h-4 w-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-zinc-800 text-red-400 hover:text-red-300 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
