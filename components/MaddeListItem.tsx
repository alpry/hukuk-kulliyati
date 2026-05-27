'use client'

import Link from 'next/link'
import { ArrowRight, StickyNote } from 'lucide-react'
import { Highlight } from '@/lib/highlight'
import type { ColorScheme } from '@/lib/kanun-colors'

export type MaddeListItemProps = {
  kanunId: string | number
  maddeId: string | number
  maddeNo: number
  baslik?: string | null
  pathLabel?: string | null
  snippet?: string
  highlightQuery?: string
  hasNote?: boolean
  cs: ColorScheme
  variant?: 'row' | 'card'
}

export default function MaddeListItem({
  kanunId,
  maddeId,
  maddeNo,
  baslik,
  pathLabel,
  snippet,
  highlightQuery,
  hasNote,
  cs,
  variant = 'row',
}: MaddeListItemProps) {
  const base =
    variant === 'row'
      ? 'group block px-3 py-2.5 rounded-lg hover:bg-[var(--surface-muted)] transition-colors cursor-pointer'
      : 'group block surface surface-hover px-4 py-3'

  const title = baslik?.trim() || null

  return (
    <Link
      href={`/dashboard/kanun/${kanunId}/madde/${maddeId}`}
      className={base}
      style={hasNote ? { borderLeft: `2px solid ${cs.primary}` } : undefined}
    >
      {/* Birinci satır: badge + konu/title + ikonlar */}
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill shrink-0 tabular-nums leading-none"
          style={{ backgroundColor: cs.light, color: cs.primary }}
        >
          Madde {maddeNo}
        </span>

        {title ? (
          <span className="flex-1 min-w-0 text-[12.5px] text-muted truncate leading-snug">
            <Highlight text={title} query={highlightQuery} />
          </span>
        ) : (
          <span className="flex-1" />
        )}

        <div className="flex items-center gap-2 shrink-0">
          {hasNote && (
            <StickyNote className="w-3.5 h-3.5" style={{ color: cs.primary }} strokeWidth={1.75} />
          )}
          <ArrowRight
            className="w-3.5 h-3.5 text-subtle group-hover:text-[var(--primary)] transition-colors"
            strokeWidth={2}
          />
        </div>
      </div>

      {/* İkincil satırlar: path + snippet (search sonucu için) */}
      {pathLabel && (
        <p className="mt-1.5 ml-[6px] text-[10.5px] text-subtle truncate">{pathLabel}</p>
      )}
      {snippet && (
        <p className="mt-1.5 ml-[6px] text-[11.5px] text-muted line-clamp-2 leading-relaxed">
          <Highlight text={snippet} query={highlightQuery} />
        </p>
      )}
    </Link>
  )
}
