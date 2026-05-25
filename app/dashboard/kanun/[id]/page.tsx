import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import KanunAccordion from '@/components/KanunAccordion'

export default async function KanunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

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

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-7">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Genel Bakış
        </Link>
        <p className="text-xs text-gray-400 mb-1.5">Kanun No: {kanun.no}</p>
        <h1 className="text-xl font-bold text-gray-900">{kanun.baslik}</h1>
        <p className="text-sm text-gray-400 mt-1.5">{maddeler?.length} madde</p>
      </div>

      <KanunAccordion maddeler={maddeler || []} kanunId={id} />
    </div>
  )
}
