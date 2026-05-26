'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Ayarlar, type AyarlarJson, type Tema, type YaziBoyutu, VARSAYILAN_AYARLAR } from '@/lib/settings'

type Ctx = {
  ayarlar: Ayarlar
  loading: boolean
  setTema: (t: Tema) => Promise<void>
  setYaziBoyutu: (y: YaziBoyutu) => Promise<void>
  setToggle: (key: keyof AyarlarJson, value: boolean) => Promise<void>
}

const SettingsContext = createContext<Ctx | null>(null)

function applyDom(tema: Tema, yazi: YaziBoyutu) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.classList.toggle('dark', tema === 'dark')
  html.classList.remove('font-sm', 'font-md', 'font-lg')
  html.classList.add(`font-${yazi}`)
  // 1 yıl geçerli cookie (FOUC engellemek için root layout script okur)
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `hk_theme=${tema}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  document.cookie = `hk_font=${yazi}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

export function SettingsProvider({ initial, children }: { initial?: Ayarlar; children: React.ReactNode }) {
  const [ayarlar, setAyarlar] = useState<Ayarlar>(initial || VARSAYILAN_AYARLAR)
  const [loading, setLoading] = useState(!initial)
  const supabase = useMemo(() => createClient(), [])

  // İlk yükleme: yoksa DB'den çek
  useEffect(() => {
    if (initial) {
      applyDom(initial.tema, initial.yazi_boyutu)
      return
    }
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('kullanici_ayarlari')
        .select('tema, yazi_boyutu, ayarlar')
        .eq('user_id', user.id)
        .maybeSingle()
      if (cancelled) return
      if (data) {
        const merged: Ayarlar = {
          tema: (data.tema as Tema) || 'light',
          yazi_boyutu: (data.yazi_boyutu as YaziBoyutu) || 'md',
          ayarlar: { ...VARSAYILAN_AYARLAR.ayarlar, ...(data.ayarlar as Partial<AyarlarJson> || {}) },
        }
        setAyarlar(merged)
        applyDom(merged.tema, merged.yazi_boyutu)
      } else {
        applyDom(VARSAYILAN_AYARLAR.tema, VARSAYILAN_AYARLAR.yazi_boyutu)
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [initial, supabase])

  const persist = useCallback(async (next: Ayarlar) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('kullanici_ayarlari').upsert({
      user_id: user.id,
      tema: next.tema,
      yazi_boyutu: next.yazi_boyutu,
      ayarlar: next.ayarlar,
      updated_at: new Date().toISOString(),
    })
  }, [supabase])

  const setTema = useCallback(async (t: Tema) => {
    const next = { ...ayarlar, tema: t }
    setAyarlar(next)
    applyDom(next.tema, next.yazi_boyutu)
    await persist(next)
  }, [ayarlar, persist])

  const setYaziBoyutu = useCallback(async (y: YaziBoyutu) => {
    const next = { ...ayarlar, yazi_boyutu: y }
    setAyarlar(next)
    applyDom(next.tema, next.yazi_boyutu)
    await persist(next)
  }, [ayarlar, persist])

  const setToggle = useCallback(async (key: keyof AyarlarJson, value: boolean) => {
    const next = { ...ayarlar, ayarlar: { ...ayarlar.ayarlar, [key]: value } }
    setAyarlar(next)
    await persist(next)
  }, [ayarlar, persist])

  return (
    <SettingsContext.Provider value={{ ayarlar, loading, setTema, setYaziBoyutu, setToggle }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings, SettingsProvider içinde kullanılmalı')
  return ctx
}
