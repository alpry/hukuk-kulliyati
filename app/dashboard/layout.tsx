import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: kanunlar } = await supabase
    .from('kanunlar')
    .select('kanun_id, baslik')
    .order('kanun_id')

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar kanunlar={kanunlar || []} email={user.email || ''} />
      <main className="flex-1 min-h-screen pt-14 lg:pt-0 overflow-y-auto bg-slate-100 px-4 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
