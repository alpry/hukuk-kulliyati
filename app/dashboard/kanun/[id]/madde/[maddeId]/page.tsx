import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NoteEditor from '@/components/NoteEditor'
import { getColorScheme } from '@/lib/kanun-colors'

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

  const pathParts = madde.path ? madde.path.split(' > ').slice(1) : []
  const cs = getColorScheme(kanun?.baslik || '')

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/kanun/${id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-3"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {kanun?.baslik}
        </Link>

        {pathParts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {pathParts.map((part: string, i: number) => {
              const isLast = i === pathParts.length - 1
              return (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-300 text-[10px]">›</span>}
                  {!isLast ? (
                    <Link
                      href={`/dashboard/kanun/${id}?section=${encodeURIComponent(part)}`}
                      className="text-[10px] text-slate-500 hover:text-slate-700 hover:underline transition-colors"
                    >
                      {part}
                    </Link>
                  ) : (
                    <span className="text-[10px] text-slate-700 font-medium">{part}</span>
                  )}
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 lg:p-6 mb-4">
        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-slate-100">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: cs.light, color: cs.primary }}
          >
            Madde {madde.madde_no}
          </span>
          {madde.baslik && (
            <span className="text-xs font-semibold text-slate-800">{madde.baslik}</span>
          )}
        </div>

        <div className="text-xs text-slate-800 leading-6 whitespace-pre-line">
          {madde.metin}
        </div>
      </div>

      <NoteEditor maddeId={maddeId} existingNote={not} colorScheme={cs} />
    </div>
  )
}
