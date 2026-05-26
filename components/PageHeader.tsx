'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'

export default function PageHeader({
  title,
  subtitle,
  showBack = true,
}: {
  title?: string
  subtitle?: string
  showBack?: boolean
}) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-2 mb-8">
      <Link
        href="/dashboard"
        aria-label="Ana sayfa"
        className="icon-btn"
      >
        <Home className="w-[14px] h-[14px]" strokeWidth={1.75} />
      </Link>
      {showBack && (
        <button
          onClick={() => router.back()}
          aria-label="Geri"
          className="icon-btn"
        >
          <ArrowLeft className="w-[14px] h-[14px]" strokeWidth={1.75} />
        </button>
      )}
      {(title || subtitle) && (
        <div className="ml-2 min-w-0">
          {subtitle && <p className="text-[10px] uppercase tracking-widest text-subtle">{subtitle}</p>}
          {title && <p className="text-[13px] font-semibold truncate">{title}</p>}
        </div>
      )}
    </div>
  )
}
