import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import KanunAccordion from '@/components/KanunAccordion'
import { getColorScheme } from '@/lib/kanun-colors'

export default async function KanunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: kanun } = await supabase
    .from('kanunlar')
    .select('*')
    .eq('kanun_id', id)
    .single()

  if (!kanun) notFound()

  const { data: maddeler } = await supabase
    .from('maddeler')
    .select('id, madde_no, path, baslik')
    .eq('kanun_id', id)
    .order('madde_no')

  const maddeIds = (maddeler || []).map(m => Number(m.id))

  const { data: notlar } = user && maddeIds.length > 0
    ? await supabase
        .from('notlar')
        .select('madde_id')
        .eq('user_id', user.id)
        .in('madde_id', maddeIds)
    : { data: [] }

  const noteIds = (notlar || []).map(n => String(n.madde_id))
  const cs = getColorScheme(kanun.baslik)

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Genel Bakış
        </Link>
        <p className="text-xs text-slate-400 mb-1.5 font-medium">Kanun No: {kanun.no}</p>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{kanun.baslik}</h1>
        <p className="text-sm text-slate-400 mt-1.5">{maddeler?.length} madde</p>
      </div>

      <KanunAccordion
        maddeler={maddeler || []}
        kanunId={id}
        noteIds={noteIds}
        colorScheme={cs}
      />
    </div>
  )
}
