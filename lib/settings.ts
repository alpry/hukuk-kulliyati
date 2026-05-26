export type Tema = 'light' | 'dark'
export type YaziBoyutu = 'sm' | 'md' | 'lg'

export type AyarlarJson = {
  // Kanun Görünümü
  maddeBasliklariniGoster: boolean
  dipnotlariGoster: boolean
  ilgiliMaddeBaglantilari: boolean
  kanunDegisiklikleriniVurgula: boolean
  // Not
  otomatikKaydet: boolean
  // Arama kapsamı — bağımsız bayraklar
  aramaKanunMaddeleri: boolean
  aramaNotlar: boolean
  aramaIctihatlar: boolean
  // Bildirimler
  bildirimKanunDegisiklikleri: boolean
  bildirimSinav: boolean
}

export type Ayarlar = {
  tema: Tema
  yazi_boyutu: YaziBoyutu
  ayarlar: AyarlarJson
}

export const VARSAYILAN_AYARLAR: Ayarlar = {
  tema: 'light',
  yazi_boyutu: 'md',
  ayarlar: {
    maddeBasliklariniGoster: true,
    dipnotlariGoster: true,
    ilgiliMaddeBaglantilari: true,
    kanunDegisiklikleriniVurgula: true,
    otomatikKaydet: true,
    aramaKanunMaddeleri: true,
    aramaNotlar: true,
    aramaIctihatlar: false,
    bildirimKanunDegisiklikleri: false,
    bildirimSinav: false,
  },
}
