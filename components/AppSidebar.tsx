'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Notebook,
  GraduationCap,
  Star,
  Clock,
  Scale,
  RefreshCw,
  Settings,
  Menu,
  X,
  Scale as Logo,
} from 'lucide-react'
import LogoutButton from './LogoutButton'

type Item = {
  label: string
  href: string
  Icon: typeof Home
  match?: (p: string) => boolean
  soon?: boolean
}

const items: Item[] = [
  { label: 'Ana Sayfa', href: '/dashboard', Icon: Home, match: p => p === '/dashboard' },
  { label: 'Kanunlar', href: '/dashboard/kanunlar', Icon: BookOpen, match: p => p.startsWith('/dashboard/kanunlar') || p.startsWith('/dashboard/kanun/') },
  { label: 'Notlarım', href: '/dashboard/notlar', Icon: Notebook, match: p => p.startsWith('/dashboard/notlar') },
  { label: 'Sınav Modu', href: '/dashboard/sinav', Icon: GraduationCap, match: p => p.startsWith('/dashboard/sinav') },
  { label: 'Favoriler', href: '/dashboard/favoriler', Icon: Star, match: p => p.startsWith('/dashboard/favoriler') },
  { label: 'Son Açılanlar', href: '/dashboard/son-acilan', Icon: Clock, match: p => p.startsWith('/dashboard/son-acilan') },
  { label: 'İçtihatlar', href: '/dashboard/ictihatlar', Icon: Scale, soon: true },
  { label: 'Kanun Değişiklikleri', href: '/dashboard/kanun-degisiklikleri', Icon: RefreshCw, soon: true },
  { label: 'Ayarlar', href: '/dashboard/ayarlar', Icon: Settings, match: p => p.startsWith('/dashboard/ayarlar') },
]

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-3">
      {items.map(it => {
        const active = it.match ? it.match(pathname) : pathname === it.href
        const Icon = it.Icon
        const content = (
          <>
            <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 truncate">{it.label}</span>
            {it.soon && <span className="badge-soon">Yakında</span>}
          </>
        )
        const cls = `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
          active
            ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold'
            : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]'
        }`
        if (it.soon) {
          return (
            <span key={it.label} className={cls + ' cursor-not-allowed opacity-80'}>
              {content}
            </span>
          )
        }
        return (
          <Link key={it.label} href={it.href} onClick={onNavigate} className={cls}>
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AppSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  const Header = (
    <div className="px-5 py-6 border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
        >
          <Logo className="w-[22px] h-[22px]" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-none tracking-tight">Hukuk Külliyatı</p>
          <p className="text-[11px] text-subtle mt-1.5 leading-none">Türk Hukuku · Tam Metin</p>
        </div>
      </div>
    </div>
  )

  const Footer = (
    <div className="px-3 py-3 border-t border-[var(--border)]">
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--surface-muted)] mb-2">
        <div className="w-6 h-6 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 text-[11px] font-semibold">
          {email[0]?.toUpperCase()}
        </div>
        <p className="text-[11px] text-muted truncate flex-1">{email}</p>
      </div>
      <LogoutButton />
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-[var(--surface)] border-r border-[var(--border)]">
        {Header}
        <div className="flex-1 overflow-y-auto">
          <NavList pathname={pathname} />
        </div>
        {Footer}
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--surface)] border-b border-[var(--border)] h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-1 rounded-lg hover:bg-[var(--surface-muted)]"
          aria-label="Menüyü aç"
        >
          <Menu className="w-5 h-5 text-muted" strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
          >
            <Logo className="w-4 h-4" strokeWidth={2.25} />
          </div>
          <span className="text-[13px] font-semibold tracking-tight">Hukuk Külliyatı</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-[var(--surface)] flex flex-col border-r border-[var(--border)]">
            <div className="px-5 py-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}
                >
                  <Logo className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <p className="text-[14px] font-semibold tracking-tight">Hukuk Külliyatı</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)]">
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            {Footer}
          </aside>
        </>
      )}
    </>
  )
}
