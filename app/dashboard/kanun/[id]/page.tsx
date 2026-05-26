import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'
import KanunView from '@/components/KanunView'
import PageHeader from '@/components/PageHeader'
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
    <div className="page-fade">
      <PageHeader />

      <div className="mb-6">
        <Link
          href="/dashboard/kanunlar"
          className="inline-flex items-center gap-1 text-[11px] text-subtle hover:text-muted transition-colors mb-3"
        >
          <ChevronLeft className="w-3 h-3" />
          Kanunlar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[var(--primary)]" strokeWidth={1.75} />
          <p className="text-[11px] text-subtle font-medium">Kanun No: {kanun.no}</p>
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight">{kanun.baslik}</h1>
        <p className="text-[12px] text-subtle mt-1">{maddeler?.length} madde</p>
      </div>

      <KanunView
        maddeler={maddeler || []}
        kanunId={id}
        noteIds={noteIds}
        colorScheme={cs}
      />
    </div>
  )
}
