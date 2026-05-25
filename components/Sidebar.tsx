'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

type Kanun = { kanun_id: number; baslik: string }

export default function Sidebar({ kanunlar, email }: { kanunlar: Kanun[]; email: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  const NavItems = () => (
    <div className="flex flex-col gap-0.5 px-3">
      <Link
        href="/dashboard"
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
          pathname === '/dashboard'
            ? 'bg-white/10 text-white font-medium'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Genel Bakış
      </Link>

      <p className="text-xs font-medium text-slate-500 uppercase tracking-widest px-3 pt-5 pb-1.5">Kanunlar</p>

      {kanunlar.map(k => (
        <Link
          key={k.kanun_id}
          href={`/dashboard/kanun/${k.kanun_id}`}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all leading-snug ${
            pathname.startsWith(`/dashboard/kanun/${k.kanun_id}`)
              ? 'bg-white/10 text-white font-medium'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-60" />
          {k.baslik}
        </Link>
      ))}
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-slate-900 h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'18px',height:'18px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Hukuk Külliyatı</p>
              <p className="text-xs text-slate-500 mt-0.5">Hukuk Araştırma</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <NavItems />
        </nav>

        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-blue-400">{email[0]?.toUpperCase()}</span>
            </div>
            <p className="text-xs text-slate-400 truncate flex-1">{email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-white/5 h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">Hukuk Külliyatı</span>
        <div className="w-9" />
      </header>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-slate-900 flex flex-col">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'18px',height:'18px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white">Hukuk Külliyatı</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3">
              <NavItems />
            </nav>
            <div className="px-4 py-4 border-t border-white/5">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-blue-400">{email[0]?.toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-400 truncate flex-1">{email}</p>
              </div>
              <LogoutButton />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
