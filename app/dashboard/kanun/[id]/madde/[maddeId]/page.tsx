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

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/kanun/${id}`}
          className="text-sm text-gray-400 hover:text-blue-600 transition-colors"
        >
          ← {kanun?.baslik}
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
            Madde {madde.madde_no}
          </span>
          {madde.baslik && (
            <span className="text-sm font-medium text-gray-700">{madde.baslik}</span>
          )}
        </div>

        {madde.path && (
          <p className="text-xs text-gray-400 mb-4">{madde.path}</p>
        )}

        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
          {madde.metin}
        </div>
      </div>

      <NoteEditor maddeId={maddeId} existingNote={not} />
    </div>
  )
}
