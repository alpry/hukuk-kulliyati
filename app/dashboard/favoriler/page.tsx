import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'

type FavRow = {
  id: string
  created_at: string
  madde_id: number
  maddeler: {
    id: number
    madde_no: number
    baslik: string | null
    metin: string
    kanun_id: number
    kanunlar: { kanun_id: number; baslik: string } | null
  } | null
}

export default async function FavorilerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('favoriler')
    .select(`
      id, created_at, madde_id,
      maddeler:madde_id ( id, madde_no, baslik, metin, kanun_id,
        kanunlar:kanun_id ( kanun_id, baslik )
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const favoriler = (data as FavRow[] | null) || []

  return (
    <div className="page-fade">
      <PageHeader />

      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1.5">
          <Star className="w-[15px] h-[15px] text-amber-500" strokeWidth={1.75} fill="currentColor" />
          <h1 className="text-[22px] font-semibold tracking-tight">Favoriler</h1>
        </div>
        <p className="text-[12.5px] text-subtle">{favoriler.length} madde</p>
      </div>

      {favoriler.length === 0 ? (
        <div className="surface p-8 text-center">
          <Star className="w-6 h-6 text-subtle mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-[13px] font-medium">Favori maddeniz yok</p>
          <p className="text-[12px] text-subtle mt-1">
            Bir madde sayfasında yıldız ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <ul className="surface divide-y divide-[var(--border)]">
          {favoriler.map(f => {
            const m = f.maddeler
            const k = m?.kanunlar
            if (!m || !k) return null
            return (
              <li key={f.id}>
                <Link
                  href={`/dashboard/kanun/${k.kanun_id}/madde/${m.id}`}
                  className="block px-4 py-3.5 hover:bg-[var(--surface-muted)] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill bg-[var(--primary-soft)] text-[var(--primary)]">
                      Madde {m.madde_no}
                    </span>
                    <span className="text-[11px] text-muted truncate">{k.baslik}</span>
                  </div>
                  {m.baslik && <p className="text-[12px] font-medium mb-1">{m.baslik}</p>}
                  <p className="text-[12px] text-muted line-clamp-2">{m.metin}</p>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--primary)]">
                    Aç <ArrowRight className="w-3 h-3" strokeWidth={2} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
