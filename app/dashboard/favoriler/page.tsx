import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'
import FavorilerList, { type FavRow } from '@/components/FavorilerList'

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

      <FavorilerList favoriler={favoriler} />
    </div>
  )
}
