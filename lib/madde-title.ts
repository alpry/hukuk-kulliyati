// Madde için konu/title ve ata-yol türetimi.
// Veride `baslik` çoğunlukla boş; gerçek konu `path`'in son segmentindedir
// (örn. "I. Genel olarak", "1. Yazılmamış sayılma", "D. Sözleşmelerin yorumu, muvazaalı işlemler").
// İlk segment kanunun adıdır; gösterimde düşürülür.

import { normalizeTitle } from './text-case'

export type DerivedTitle = {
  title: string | null      // ekranda madde başlığı (önekler temizlenmiş)
  parentPath: string | null // konu yolundan başlık dışındaki kısım, " › " ayraçlı
  rawLeaf: string | null    // son segmentin ham hali (önek dahil)
}

const PREFIX_RE = /^([A-ZİĞÜŞÖÇ]+|[a-zığüşöç]+|\d+)\.\s+/u

export function stripLeafPrefix(s: string): string {
  return s.replace(PREFIX_RE, '').trim() || s
}

export function deriveMaddeTitle(
  baslik: string | null | undefined,
  path: string | null | undefined,
): DerivedTitle {
  const trimmed = (baslik || '').trim()
  const parts = (path || '').split(' > ').map(s => s.trim()).filter(Boolean)
  // İlk segment kanun adı (örn. "Türk Borçlar Kanunu") — düşür
  const ancestry = parts.slice(1)

  if (trimmed) {
    return {
      title: normalizeTitle(trimmed),
      parentPath: ancestry.length ? ancestry.map(normalizeTitle).join(' › ') : null,
      rawLeaf: ancestry[ancestry.length - 1] ?? null,
    }
  }

  if (ancestry.length === 0) return { title: null, parentPath: null, rawLeaf: null }

  const leaf = ancestry[ancestry.length - 1]
  const cleaned = stripLeafPrefix(leaf)
  const parentParts = ancestry.slice(0, -1)
  return {
    title: normalizeTitle(cleaned || leaf),
    parentPath: parentParts.length ? parentParts.map(normalizeTitle).join(' › ') : null,
    rawLeaf: leaf,
  }
}
