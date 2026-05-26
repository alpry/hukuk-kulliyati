'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-muted hover:text-red-600 hover:bg-red-500/10 transition-colors border border-[var(--border)]"
    >
      <LogOut className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
      Çıkış Yap
    </button>
  )
}
