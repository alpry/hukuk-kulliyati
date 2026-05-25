import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NoteEditor from '@/components/NoteEditor'

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

  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/kanun/${id}`}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {kanun?.baslik}
        </Link>

        {pathParts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {pathParts.map((part: string, i: number) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300 text-xs">›</span>}
                <span className="text-xs text-gray-500">{part}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 mb-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full shrink-0">
            Madde {madde.madde_no}
          </span>
          {madde.baslik && (
            <span className="text-sm font-semibold text-gray-800">{madde.baslik}</span>
          )}
        </div>

        <div className="text-sm text-gray-800 leading-7 whitespace-pre-line">
          {madde.metin}
        </div>
      </div>

      <NoteEditor maddeId={maddeId} existingNote={not} />
    </div>
  )
}
