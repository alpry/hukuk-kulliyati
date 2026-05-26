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
    <div className="p-5 lg:p-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Genel Bakış</h1>
        <p className="text-xs text-slate-500 mt-1">Tüm kanunlara buradan ulaşabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { label: 'Kanun', value: kanunlar?.length || 0, color: false },
          { label: 'Madde', value: toplamMadde, color: false },
          { label: 'Notum', value: notSayisi || 0, color: true },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg bg-white border border-slate-200 p-5">
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2.5 ${color ? 'text-blue-600' : 'text-slate-400'}`}>
              {label}
            </p>
            <p className={`text-3xl font-bold tracking-tight ${color ? 'text-blue-600' : 'text-slate-900'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Kanunlar</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {kanunStats.map(k => (
          <Link
            key={k.kanun_id}
            href={`/dashboard/kanun/${k.kanun_id}`}
            className="group flex flex-col bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-all duration-200"
          >
            <p className="text-[10px] font-medium text-slate-400 mb-2">No: {k.no}</p>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug text-xs flex-1">
              {k.baslik}
            </h3>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <p className="text-[10px] text-slate-400">{k.maddeSayisi} madde</p>
              <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
