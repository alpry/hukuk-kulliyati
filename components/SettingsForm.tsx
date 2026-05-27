'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Type, FileDown, KeyRound, Mail, Eye, Search, Bell, Notebook, Check, Palette } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'
import { type AyarlarJson, type YaziBoyutu } from '@/lib/settings'
import { TEMA_RENKLERI, type TemaRenk, applyTemaRenk, getInitialTemaRenk } from '@/lib/tema-renk'
import LogoutButton from './LogoutButton'
import { createClient } from '@/lib/supabase/client'

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="surface p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-[15px] h-[15px] text-[var(--primary)]" strokeWidth={1.75} />
        <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0">{children}</div>
}

function Toggle({ label, desc, value, onChange }: { label: React.ReactNode; desc?: React.ReactNode; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row>
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium leading-snug flex items-center gap-2 flex-wrap">{label}</p>
        {desc && <p className="text-[11px] text-subtle mt-0.5 leading-snug">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-[22px] w-10 rounded-full transition-colors shrink-0 border ${
          value
            ? 'bg-[var(--primary)] border-[var(--primary)]'
            : 'bg-[var(--surface-muted)] border-[var(--border-strong)]'
        }`}
      >
        <span className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0'}`} />
      </button>
    </Row>
  )
}

function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`seg-btn ${active ? 'active' : ''}`}>
      {children}
    </button>
  )
}

export default function SettingsForm({ email }: { email: string }) {
  const { ayarlar, setTema, setYaziBoyutu, setToggle } = useSettings()
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<string | null>(null)
  const [temaRenk, setTemaRenk] = useState<TemaRenk>('mor')

  useEffect(() => {
    setTemaRenk(getInitialTemaRenk())
  }, [])

  function handleTemaRenk(r: TemaRenk) {
    setTemaRenk(r)
    applyTemaRenk(r)
  }

  async function handlePasswordReset() {
    setPwLoading(true)
    setPwMsg(null)
    const supabase = createClient()
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setPwMsg(error ? `Hata: ${error.message}` : 'Şifre sıfırlama bağlantısı e-postanıza gönderildi.')
    setPwLoading(false)
  }

  const t = <K extends keyof AyarlarJson>(key: K) => ayarlar.ayarlar[key]
  const set = <K extends keyof AyarlarJson>(key: K, v: boolean) => setToggle(key, v)

  return (
    <div className="space-y-4">
      <Section title="Hesap" icon={Mail}>
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-[11px] text-subtle">E-posta</p>
            <p className="text-[12px] font-medium">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
          <button
            onClick={handlePasswordReset}
            disabled={pwLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[12px] text-muted hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] disabled:opacity-50"
          >
            <KeyRound className="w-3.5 h-3.5" strokeWidth={1.75} />
            {pwLoading ? 'Gönderiliyor…' : 'Şifre değiştir'}
          </button>
          <div className="flex-1" />
          <div className="max-w-[180px]"><LogoutButton /></div>
        </div>
        {pwMsg && <p className="text-[11px] text-subtle">{pwMsg}</p>}
      </Section>

      <Section title="Görünüm" icon={Eye}>
        <div className="flex items-center justify-between gap-4 py-1">
          <div>
            <p className="text-[12px] font-medium">Tema</p>
            <p className="text-[11px] text-subtle mt-0.5">Açık veya koyu mod.</p>
          </div>
          <div className="seg-group">
            <SegBtn active={ayarlar.tema === 'light'} onClick={() => setTema('light')}>
              <span className="inline-flex items-center gap-1"><Sun className="w-3 h-3" />Açık</span>
            </SegBtn>
            <SegBtn active={ayarlar.tema === 'dark'} onClick={() => setTema('dark')}>
              <span className="inline-flex items-center gap-1"><Moon className="w-3 h-3" />Koyu</span>
            </SegBtn>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 py-1">
          <div>
            <p className="text-[12px] font-medium flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-subtle" strokeWidth={1.75} />
              Tema Rengi
            </p>
            <p className="text-[11px] text-subtle mt-0.5">Arayüzdeki vurgu rengi.</p>
          </div>
          <div className="flex items-center gap-2">
            {TEMA_RENKLERI.map(t => {
              const selected = temaRenk === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemaRenk(t.id)}
                  aria-label={t.label}
                  aria-pressed={selected}
                  title={t.label}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: t.hex,
                    boxShadow: selected
                      ? `0 0 0 2px var(--background), 0 0 0 4px ${t.hex}`
                      : '0 1px 2px rgba(0,0,0,0.15)',
                  }}
                >
                  {selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 py-1">
          <div>
            <p className="text-[12px] font-medium">Yazı boyutu</p>
            <p className="text-[11px] text-subtle mt-0.5">Okuma rahatlığı için.</p>
          </div>
          <div className="seg-group">
            {(['sm','md','lg'] as YaziBoyutu[]).map(s => (
              <SegBtn key={s} active={ayarlar.yazi_boyutu === s} onClick={() => setYaziBoyutu(s)}>
                <span className="inline-flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  {s === 'sm' ? 'Küçük' : s === 'md' ? 'Orta' : 'Büyük'}
                </span>
              </SegBtn>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Kanun Görünümü" icon={Eye}>
        <Toggle label="Madde başlıklarını göster" value={t('maddeBasliklariniGoster')} onChange={v => set('maddeBasliklariniGoster', v)} />
        <Toggle label="Dipnotları göster" value={t('dipnotlariGoster')} onChange={v => set('dipnotlariGoster', v)} />
        <Toggle label="İlgili madde bağlantıları göster" value={t('ilgiliMaddeBaglantilari')} onChange={v => set('ilgiliMaddeBaglantilari', v)} />
        <Toggle label="Kanun değişikliklerini vurgula" value={t('kanunDegisiklikleriniVurgula')} onChange={v => set('kanunDegisiklikleriniVurgula', v)} />
      </Section>

      <Section title="Not Ayarları" icon={Notebook}>
        <Toggle label="Otomatik kaydet" desc="Yazarken arka planda notlarınızı kaydet." value={t('otomatikKaydet')} onChange={v => set('otomatikKaydet', v)} />
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
          <button disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[12px] text-subtle cursor-not-allowed">
            <FileDown className="w-3.5 h-3.5" strokeWidth={1.75} />
            PDF olarak indir
          </button>
          <button disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[12px] text-subtle cursor-not-allowed">
            <FileDown className="w-3.5 h-3.5" strokeWidth={1.75} />
            Word olarak indir
          </button>
          <span className="badge-soon">Yakında</span>
        </div>
      </Section>

      <Section title="Arama kapsamı" icon={Search}>
        <Toggle
          label="Kanun maddelerinde ara"
          value={t('aramaKanunMaddeleri')}
          onChange={v => set('aramaKanunMaddeleri', v)}
        />
        <Toggle
          label="Notlarımda ara"
          value={t('aramaNotlar')}
          onChange={v => set('aramaNotlar', v)}
        />
        <Toggle
          label={<>İçtihatlarda ara <span className="badge-soon">Yakında</span></>}
          value={t('aramaIctihatlar')}
          onChange={v => set('aramaIctihatlar', v)}
        />
      </Section>

      <Section title="Bildirimler" icon={Bell}>
        <Toggle label="Kanun değişiklikleri" value={t('bildirimKanunDegisiklikleri')} onChange={v => set('bildirimKanunDegisiklikleri', v)} />
        <Toggle label="Sınav bildirimleri" value={t('bildirimSinav')} onChange={v => set('bildirimSinav', v)} />
      </Section>
    </div>
  )
}
