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
      .upsert({ kanun_id: kanun.id, baslik: kanun.baslik, no: kanun.no })

    if (kanunError) {
      console.error('Kanun hatası:', kanunError)
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
