import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: kanunlar } = await supabase
    .from('kanunlar')
    .select('kanun_id, baslik, no')
    .order('kanun_id')

  const { count: notSayisi } = await supabase
    .from('notlar')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const kanunStats = await Promise.all(
    (kanunlar || []).map(async k => {
      const { count } = await supabase
        .from('maddeler')
        .select('id', { count: 'exact', head: true })
        .eq('kanun_id', k.kanun_id)
      return { ...k, maddeSayisi: count || 0 }
    })
  )

  const toplamMadde = kanunStats.reduce((a, k) => a + k.maddeSayisi, 0)

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-sm text-gray-500 mt-1">Tüm kanunlara buradan ulaşabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Kanun</p>
          <p className="text-3xl font-bold text-gray-900">{kanunlar?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Madde</p>
          <p className="text-3xl font-bold text-gray-900">{toplamMadde}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Notum</p>
          <p className="text-3xl font-bold text-blue-600">{notSayisi || 0}</p>
        </div>
      </div>

      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Kanunlar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {kanunStats.map(k => (
          <Link
            key={k.kanun_id}
            href={`/dashboard/kanun/${k.kanun_id}`}
            className="group flex flex-col bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <p className="text-xs text-gray-400 mb-2">No: {k.no}</p>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug text-sm flex-1">
              {k.baslik}
            </h3>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">{k.maddeSayisi} madde</p>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
