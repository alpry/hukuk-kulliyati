import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'

export default async function KanunlarPage() {
  const supabase = await createClient()

  const { data: kanunlar } = await supabase
    .from('kanunlar')
    .select('kanun_id, baslik, no')
    .order('kanun_id')

  const stats = await Promise.all(
    (kanunlar || []).map(async k => {
      const { count } = await supabase
        .from('maddeler')
        .select('id', { count: 'exact', head: true })
        .eq('kanun_id', k.kanun_id)
      return { ...k, maddeSayisi: count || 0 }
    })
  )

  return (
    <div className="page-fade">
      <PageHeader />
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1.5">
          <BookOpen className="w-[15px] h-[15px] text-[var(--primary)]" strokeWidth={1.75} />
          <h1 className="text-[22px] font-semibold tracking-tight">Kanunlar</h1>
        </div>
        <p className="text-[12.5px] text-subtle">Mevzuat metinleri tam metin olarak erişilebilir.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {stats.map(k => (
          <Link
            key={k.kanun_id}
            href={`/dashboard/kanun/${k.kanun_id}`}
            className="group surface surface-hover p-4 flex flex-col"
          >
            <p className="text-[10px] font-medium text-subtle mb-1.5">Kanun No: {k.no}</p>
            <h3 className="font-semibold text-[13px] leading-snug flex-1 group-hover:text-[var(--primary)] transition-colors">
              {k.baslik}
            </h3>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
              <p className="text-[11px] text-subtle">{k.maddeSayisi} madde</p>
              <ArrowRight className="w-3.5 h-3.5 text-subtle group-hover:text-[var(--primary)] transition-colors" strokeWidth={2} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
