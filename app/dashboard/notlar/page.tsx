import { Notebook } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'
import NotlarList, { type NotRow } from '@/components/NotlarList'

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

      <NotlarList notlar={notlar} />
    </div>
  )
}
