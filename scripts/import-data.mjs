import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://gcsdtwkwfzvzpxmazele.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const data = JSON.parse(readFileSync('C:\\Users\\BT\\hukuk-kulliyati\\data.json', 'utf-8'))

function collectMaddeler(node, kanunId, path = '') {
  const results = []
  const currentPath = path ? `${path} > ${node.baslik || ''}` : (node.baslik || '')

  if (node.tip === 'madde') {
    results.push({
      kanun_id: kanunId,
      madde_no: node.no,
      metin: node.metin || '',
      path: path,
      baslik: node.baslik || ''
    })
  }

  if (node.children) {
    for (const child of node.children) {
      results.push(...collectMaddeler(child, kanunId, currentPath))
    }
  }

  return results
}

async function main() {
  for (const kanun of data.kanunlar) {
    console.log(`İşleniyor: ${kanun.baslik}`)

    const { error: kanunError } = await supabase
      .from('kanunlar')
      .upsert({ kanun_id: kanun.id, baslik: kanun.baslik, no: kanun.no }, { onConflict: 'kanun_id' })

    if (kanunError) {
      console.error('Kanun hatası:', kanunError)
      continue
    }

    // Bu kanuna ait madde id'lerini al
    const { data: mevcutMaddeler } = await supabase
      .from('maddeler')
      .select('id')
      .eq('kanun_id', kanun.id)

    if (mevcutMaddeler && mevcutMaddeler.length > 0) {
      const maddeIds = mevcutMaddeler.map(m => m.id)
      // Önce bağlı notları 100'er batch halinde sil
      for (let b = 0; b < maddeIds.length; b += 100) {
        const batchIds = maddeIds.slice(b, b + 100)
        const { error: notDelError } = await supabase
          .from('notlar')
          .delete()
          .in('madde_id', batchIds)
        if (notDelError) console.error('Not silme hatası:', notDelError)
      }
    }

    // Mevcut maddeler sil
    const { error: delError } = await supabase
      .from('maddeler')
      .delete()
      .eq('kanun_id', kanun.id)
    if (delError) {
      console.error('Silme hatası:', delError)
      continue
    }

    const maddeler = collectMaddeler(kanun, kanun.id)
    console.log(`  ${maddeler.length} madde bulundu`)

    // 500'er adet yükle
    for (let i = 0; i < maddeler.length; i += 500) {
      const batch = maddeler.slice(i, i + 500)
      const { error } = await supabase.from('maddeler').insert(batch)
      if (error) {
        console.error('Madde hatası:', error)
      } else {
        console.log(`  ${i + batch.length}/${maddeler.length} yüklendi`)
      }
    }
  }

  console.log('Tamamlandı!')
}

main()
