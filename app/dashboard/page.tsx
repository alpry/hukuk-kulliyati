import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: kanunlar } = await supabase
    .from('kanunlar')
    .select('kanun_id, baslik, no')
    .order('kanun_id')

  const { data: notSayisi } = await supabase
    .from('notlar')
    .select('id', { count: 'exact' })
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Tüm kanunlara buradan ulaşabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Toplam Kanun</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{kanunlar?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Toplam Madde</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {kanunStats.reduce((a, k) => a + k.maddeSayisi, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Notlarım</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{notSayisi?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kanunStats.map(k => (
          <a
            key={k.kanun_id}
            href={`/dashboard/kanun/${k.kanun_id}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Kanun No: {k.no}</p>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {k.baslik}
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">{k.maddeSayisi} madde</p>
          </a>
        ))}
      </div>
    </div>
  )
}
