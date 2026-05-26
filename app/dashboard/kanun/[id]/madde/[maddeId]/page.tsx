import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import NoteEditor from '@/components/NoteEditor'
import PageHeader from '@/components/PageHeader'
import FavoriteButton from '@/components/FavoriteButton'
import RecordView from '@/components/RecordView'
import { getColorScheme } from '@/lib/kanun-colors'
import { deriveMaddeTitle } from '@/lib/madde-title'
import { normalizeTitle } from '@/lib/text-case'

export default async function MaddePage({
  params,
}: {
  params: Promise<{ id: string; maddeId: string }>
}) {
  const { id, maddeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: madde } = await supabase
    .from('maddeler')
    .select('*')
    .eq('id', maddeId)
    .single()

  if (!madde) notFound()

  const { data: kanun } = await supabase
    .from('kanunlar')
    .select('baslik, no')
    .eq('kanun_id', id)
    .single()

  const { data: not } = await supabase
    .from('notlar')
    .select('*')
    .eq('user_id', user!.id)
    .eq('madde_id', maddeId)
    .maybeSingle()

  const { data: fav } = await supabase
    .from('favoriler')
    .select('id')
    .eq('user_id', user!.id)
    .eq('madde_id', Number(maddeId))
    .maybeSingle()

  const pathParts = madde.path ? madde.path.split(' > ').slice(1) : []
  const cs = getColorScheme(kanun?.baslik || '')
  const derivedTitle = deriveMaddeTitle(madde.baslik, madde.path).title

  return (
    <div className="page-fade">
      <PageHeader />

      <RecordView
        kanunId={id}
        kanunBaslik={kanun?.baslik || ''}
        maddeId={maddeId}
        maddeNo={Number(madde.madde_no)}
        baslik={madde.baslik || null}
        metinOzet={(madde.metin || '').slice(0, 200)}
      />

      <nav aria-label="Konum" className="mb-5">
        <ol className="flex flex-wrap items-center gap-1.5 text-[12px]">
          <li>
            <Link href="/dashboard/kanunlar" className="text-muted hover:text-[var(--foreground)] transition-colors">
              Kanunlar
            </Link>
          </li>
          <li><ChevronRight className="w-3 h-3 text-subtle" strokeWidth={2} /></li>
          <li>
            <Link href={`/dashboard/kanun/${id}`} className="text-muted hover:text-[var(--foreground)] transition-colors truncate max-w-[260px] inline-block align-bottom">
              {kanun?.baslik}
            </Link>
          </li>
          <li><ChevronRight className="w-3 h-3 text-subtle" strokeWidth={2} /></li>
          <li>
            <span className="font-semibold">Madde {madde.madde_no}</span>
          </li>
        </ol>

        {pathParts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {pathParts.map((part: string, i: number) => {
              const isLast = i === pathParts.length - 1
              const label = normalizeTitle(part)
              return (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-subtle text-[10px]">›</span>}
                  {!isLast ? (
                    <Link
                      href={`/dashboard/kanun/${id}?section=${encodeURIComponent(part)}`}
                      className="text-[10.5px] text-subtle hover:text-muted hover:underline transition-colors"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="text-[10.5px] text-muted font-medium">{label}</span>
                  )}
                </span>
              )
            })}
          </div>
        )}
      </nav>

      <div className="surface p-5 lg:p-6 mb-4">
        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[var(--border)]">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full card-pill shrink-0"
            style={{ backgroundColor: cs.light, color: cs.primary }}
          >
            Madde {madde.madde_no}
          </span>
          {derivedTitle && (
            <span className="text-[13px] font-semibold flex-1 truncate">{derivedTitle}</span>
          )}
          <FavoriteButton maddeId={Number(maddeId)} initial={!!fav} />
        </div>

        <div className="text-[13px] leading-7 whitespace-pre-line">
          {madde.metin}
        </div>
      </div>

      <NoteEditor maddeId={maddeId} existingNote={not} colorScheme={cs} />
    </div>
  )
}
