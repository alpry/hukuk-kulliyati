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
    <div className="p-5 lg:p-8">
      <div className="mb-7">
        <h2 className="text-xl font-bold text-gray-900">Merhaba</h2>
        <p className="text-sm text-gray-500 mt-1">Tüm kanunlara buradan ulaşabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-7">
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
          <p className="text-xs text-gray-500 mb-1">Kanun</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{kanunlar?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
          <p className="text-xs text-gray-500 mb-1">Madde</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{toplamMadde}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
          <p className="text-xs text-gray-500 mb-1">Notum</p>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">{notSayisi || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {kanunStats.map(k => (
          <Link
            key={k.kanun_id}
            href={`/dashboard/kanun/${k.kanun_id}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <p className="text-xs text-gray-400 mb-1.5">Kanun No: {k.no}</p>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug text-sm lg:text-base">
              {k.baslik}
            </h3>
            <p className="text-xs text-gray-400 mt-3">{k.maddeSayisi} madde</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
