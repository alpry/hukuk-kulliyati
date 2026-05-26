'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getColorScheme } from '@/lib/kanun-colors'
import LogoutButton from './LogoutButton'

type Kanun = { kanun_id: number; baslik: string }

export default function Sidebar({ kanunlar, email }: { kanunlar: Kanun[]; email: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  const NavItems = () => (
    <div className="flex flex-col gap-0 px-0">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-6 pt-5 pb-3">Kanunlar</p>

      {kanunlar.map(k => {
        const cs = getColorScheme(k.baslik)
        const isActive = pathname.startsWith(`/dashboard/kanun/${k.kanun_id}`)
        return (
          <Link
            key={k.kanun_id}
            href={`/dashboard/kanun/${k.kanun_id}`}
            className={`flex items-center gap-3 px-6 py-2.5 text-xs transition-all border-l-3 leading-snug ${
              isActive
                ? 'border-l-3 bg-blue-50/50 text-slate-900 font-medium'
                : 'border-l-transparent text-slate-600 hover:text-slate-900'
            }`}
            style={isActive ? { borderLeftColor: cs.primary, backgroundColor: cs.light + '40' } : undefined}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cs.primary }} />
            <span className="flex-1">{k.baslik}</span>
          </Link>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white h-screen sticky top-0 border-r border-slate-200">
        <div className="px-6 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-900 leading-tight">Hukuk Külliyatı</p>
          <p className="text-[10px] text-slate-500 mt-1">Türk Hukuku · Tam Metin</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <NavItems />
        </nav>

        <div className="px-6 py-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 mb-3">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-[10px] font-semibold text-slate-600">
              {email[0]?.toUpperCase()}
            </div>
            <p className="text-[10px] text-slate-600 truncate flex-1">{email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-slate-900">Hukuk Külliyatı</span>
        <div className="w-9" />
      </header>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-white flex flex-col border-r border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-900">Hukuk Külliyatı</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              <NavItems />
            </nav>
            <div className="px-6 py-4 border-t border-slate-200">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 mb-3">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-[10px] font-semibold text-slate-600">
                  {email[0]?.toUpperCase()}
                </div>
                <p className="text-[10px] text-slate-600 truncate flex-1">{email}</p>
              </div>
              <LogoutButton />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
