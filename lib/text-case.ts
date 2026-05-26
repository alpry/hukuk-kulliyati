// Türkçe başlık-büyütme (title case) yardımcısı.
// Veride bazı segmentler tamamen BÜYÜK harfle gelir (örn. Anayasa: "TEMEL HAKLAR VE ÖDEVLER").
// Render sırasında bu tip değerleri "Temel Haklar ve Ödevler" biçimine çeviririz.
// Karışık veya zaten doğru yazılmış başlıklara dokunulmaz.

const SMALL_WORDS = new Set([
  've', 'veya', 'ile', 'ya', 'da', 'de', 'ki', 'ne', 'hem', 'ama', 'fakat', 'ya da',
])

// Bilinen kısaltmalar — bunlar büyük kalır
const ACRONYMS = new Set([
  'TBMM', 'AYM', 'AİHM', 'KHK', 'TCK', 'TBK', 'TMK', 'HMK', 'CMK', 'ABD', 'AB', 'TC',
])

function isAllUpper(s: string): boolean {
  // En az bir harf olmalı VE tüm harfler büyük olmalı.
  const lower = s.toLocaleLowerCase('tr-TR')
  const upper = s.toLocaleUpperCase('tr-TR')
  return lower !== s && upper === s
}

function capFirstLetter(s: string): string {
  // İlk harfi büyült (önündeki noktalama/sayıları atlayarak), kalan zaten lower.
  let i = 0
  while (i < s.length && !/\p{L}/u.test(s[i])) i++
  if (i >= s.length) return s
  return s.slice(0, i) + s[i].toLocaleUpperCase('tr-TR') + s.slice(i + 1)
}

function titleCaseToken(token: string, isFirst: boolean): string {
  if (ACRONYMS.has(token)) return token
  const lower = token.toLocaleLowerCase('tr-TR')
  if (!isFirst && SMALL_WORDS.has(lower)) return lower
  return capFirstLetter(lower)
}

export function normalizeTitle(s: string | null | undefined): string {
  const text = (s || '').trim()
  if (!text) return ''
  if (!isAllUpper(text)) return text

  const tokens = text.split(/(\s+)/)
  let wordIdx = 0
  return tokens
    .map(tok => {
      if (/^\s+$/.test(tok)) return tok
      const out = titleCaseToken(tok, wordIdx === 0)
      wordIdx++
      return out
    })
    .join('')
}

// Path metnini segmentlere bölüp her segmenti normalize edip " › " ile birleştirir.
export function normalizePathLabel(path: string | null | undefined, sep = ' › '): string {
  const text = (path || '').trim()
  if (!text) return ''
  return text
    .split(/\s*[>›]\s*/)
    .map(seg => normalizeTitle(seg))
    .filter(Boolean)
    .join(sep)
}
