import Link from 'next/link'
import { Notebook, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'

type NotRow = {
  id: string
  icerik: string
  updated_at: string | null
  madde_id: number
  maddeler: {
    id: number
    madde_no: number
    baslik: string | null
    kanun_id: number
    kanunlar: { kanun_id: number; baslik: string } | null
  } | null
}

function relTime(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'az önce'
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} sa önce`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} gün önce`
  return new Date(iso).toLocaleDateString('tr-TR')
}

export default async function NotlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('notlar')
    .select(`
      id, icerik, updated_at, madde_id,
      maddeler:madde_id ( id, madde_no, baslik, kanun_id,
        kanunlar:kanun_id ( kanun_id, baslik )
      )
    `)
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  const notlar = (data as NotRow[] | null) || []

  return (
    <div className="page-fade">
      <PageHeader />

      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1.5">
          <Notebook className="w-[15px] h-[15px] text-[var(--primary)]" strokeWidth={1.75} />
          <h1 className="text-[22px] font-semibold tracking-tight">Notlarım</h1>
        </div>
        <p className="text-[12.5px] text-subtle">{notlar.length} not</p>
      </div>

      {notlar.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="text-[13px] font-medium">Henüz notunuz yok</p>
          <p className="text-[12px] text-subtle mt-1">Bir madde sayfasına gidip not ekleyebilirsiniz.</p>
        </div>
      ) : (
        <ul className="surface divide-y divide-[var(--border)]">
          {notlar.map(n => {
            const m = n.maddeler
            const k = m?.kanunlar
            const href = m && k
              ? `/dashboard/kanun/${k.kanun_id}/madde/${m.id}`
              : '#'
            return (
              <li key={n.id}>
                <Link href={href} className="block px-4 py-3.5 hover:bg-[var(--surface-muted)] transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    {m && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill bg-[var(--primary-soft)] text-[var(--primary)]">
                        Madde {m.madde_no}
                      </span>
                    )}
                    {k && <span className="text-[11px] text-muted truncate">{k.baslik}</span>}
                    <span className="ml-auto text-[10px] text-subtle">{relTime(n.updated_at)}</span>
                  </div>
                  {m?.baslik && <p className="text-[12px] font-medium mb-1">{m.baslik}</p>}
                  <p className="text-[12px] text-muted line-clamp-2 whitespace-pre-line">{n.icerik}</p>
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
