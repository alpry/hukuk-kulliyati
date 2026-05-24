import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: kanunlar } = await supabase
    .from('kanunlar')
    .select('kanun_id, baslik')
    .order('kanun_id')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Hukuk Külliyatı</h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <p className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Kanunlar
          </p>
          {kanunlar?.map(k => (
            <Link
              key={k.kanun_id}
              href={`/dashboard/kanun/${k.kanun_id}`}
              className="block px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              {k.baslik}
            </Link>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
