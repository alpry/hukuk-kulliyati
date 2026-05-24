import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
    <div className="p-8">
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-1">Kanun No: {kanun.no}</p>
        <h2 className="text-2xl font-bold text-gray-900">{kanun.baslik}</h2>
        <p className="text-gray-500 mt-1">{maddeler?.length} madde</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {maddeler?.map(m => (
          <Link
            key={m.id}
            href={`/dashboard/kanun/${id}/madde/${m.id}`}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono font-medium text-blue-600 w-16 shrink-0">
                Md. {m.madde_no}
              </span>
              <div>
                {m.baslik && (
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {m.baslik}
                  </p>
                )}
                {m.path && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-md">{m.path}</p>
                )}
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-blue-400 text-lg">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
