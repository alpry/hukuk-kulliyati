'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Trash2 } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { getRecent, clearRecent, formatRelative, type RecentMadde } from '@/lib/recent-storage'

export default function SonAcilanPage() {
  const [items, setItems] = useState<RecentMadde[] | null>(null)

  useEffect(() => { setItems(getRecent()) }, [])

  function onClear() {
    clearRecent()
    setItems([])
  }

  return (
    <div className="page-fade">
      <PageHeader />

      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-[15px] h-[15px] text-[var(--primary)]" strokeWidth={1.75} />
            <h1 className="text-[22px] font-semibold tracking-tight">Son Açılanlar</h1>
          </div>
          <p className="text-[12.5px] text-subtle">{items?.length ?? 0} madde · bu cihazda saklanır</p>
        </div>
        {items && items.length > 0 && (
          <button onClick={onClear} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[12px] text-muted hover:text-red-600 hover:border-red-200">
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            Temizle
          </button>
        )}
      </div>

      {items === null ? null : items.length === 0 ? (
        <div className="surface p-8 text-center">
          <Clock className="w-6 h-6 text-subtle mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-[13px] font-medium">Henüz madde görüntülemediniz</p>
          <p className="text-[12px] text-subtle mt-1">Açtığınız maddeler burada listelenecek.</p>
        </div>
      ) : (
        <ul className="surface divide-y divide-[var(--border)]">
          {items.map(it => (
            <li key={it.maddeId}>
              <Link
                href={`/dashboard/kanun/${it.kanunId}/madde/${it.maddeId}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-muted)] transition-colors"
              >
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                  M. {it.maddeNo}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate">{it.baslik || it.kanunBaslik}</p>
                  {it.baslik && <p className="text-[11px] text-subtle truncate">{it.kanunBaslik}</p>}
                </div>
                <span className="text-[10px] text-subtle shrink-0">{formatRelative(it.openedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
