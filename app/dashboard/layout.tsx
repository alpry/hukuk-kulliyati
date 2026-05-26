import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppSidebar from '@/components/AppSidebar'
import { SettingsProvider } from '@/lib/settings-context'
import { VARSAYILAN_AYARLAR, type Ayarlar, type AyarlarJson, type Tema, type YaziBoyutu } from '@/lib/settings'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: ayarRow } = await supabase
    .from('kullanici_ayarlari')
    .select('tema, yazi_boyutu, ayarlar')
    .eq('user_id', user.id)
    .maybeSingle()

  const initial: Ayarlar = ayarRow
    ? {
        tema: ((ayarRow.tema as Tema) || 'light'),
        yazi_boyutu: ((ayarRow.yazi_boyutu as YaziBoyutu) || 'md'),
        ayarlar: { ...VARSAYILAN_AYARLAR.ayarlar, ...((ayarRow.ayarlar as Partial<AyarlarJson>) || {}) },
      }
    : VARSAYILAN_AYARLAR

  return (
    <SettingsProvider initial={initial}>
      <div className="min-h-screen lg:flex bg-[var(--background)]">
        <AppSidebar email={user.email || ''} />
        <main className="flex-1 min-h-screen overflow-y-auto pt-20 lg:pt-14 pb-16 px-5 sm:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SettingsProvider>
  )
}
