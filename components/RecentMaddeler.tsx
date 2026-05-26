'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { getRecent, formatRelative, type RecentMadde } from '@/lib/recent-storage'

export default function RecentMaddeler({ limit = 8, showHeader = true }: { limit?: number; showHeader?: boolean }) {
  const [items, setItems] = useState<RecentMadde[] | null>(null)

  useEffect(() => {
    setItems(getRecent())
  }, [])

  if (items === null) return null
  if (items.length === 0) {
    return (
      <div className="surface p-6 text-center text-[12px] text-subtle">
        Henüz açtığınız bir madde yok.
      </div>
    )
  }

  const list = items.slice(0, limit)
  return (
    <div>
      {showHeader && (
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-subtle" strokeWidth={1.75} />
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-subtle">Son Açılan Maddeler</h3>
        </div>
      )}
      <ul className="surface divide-y divide-[var(--border)]">
        {list.map(it => (
          <li key={it.maddeId}>
            <Link
              href={`/dashboard/kanun/${it.kanunId}/madde/${it.maddeId}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-muted)] transition-colors"
            >
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                M. {it.maddeNo}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate">
                  {it.baslik || it.kanunBaslik}
                </p>
                {it.baslik && (
                  <p className="text-[11px] text-subtle truncate">{it.kanunBaslik}</p>
                )}
              </div>
              <span className="text-[10px] text-subtle shrink-0">{formatRelative(it.openedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
