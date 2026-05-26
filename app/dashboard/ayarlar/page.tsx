import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'
import SettingsForm from '@/components/SettingsForm'

export default async function AyarlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="page-fade max-w-4xl mx-auto">
      <PageHeader />

      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1.5">
          <Settings className="w-[15px] h-[15px] text-[var(--primary)]" strokeWidth={1.75} />
          <h1 className="text-[22px] font-semibold tracking-tight">Ayarlar</h1>
        </div>
        <p className="text-[12.5px] text-subtle">Hesap, görünüm ve uygulama tercihleri.</p>
      </div>

      <SettingsForm email={user?.email || ''} />
    </div>
  )
}
