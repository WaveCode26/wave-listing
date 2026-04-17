import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Wave Listing — Otimização de Listings Amazon BR',
  description: 'Plataforma SaaS para otimização de listings Amazon Brasil com inteligência artificial.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 font-sans">{children}</body>
    </html>
  )
}
