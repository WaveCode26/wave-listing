import { SignupForm } from '@/components/auth/signup-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Criar conta — Wave Listing',
}

export default function SignupPage() {
  return <SignupForm />
}
