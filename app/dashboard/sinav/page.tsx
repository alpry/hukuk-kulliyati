'use client'

import { useState } from 'react'
import { GraduationCap, CheckSquare, FileText, Layers, BookMarked, MessagesSquare } from 'lucide-react'
import PageHeader from '@/components/PageHeader'

const tabs = [
  { id: 'multiple', label: 'Çoktan Seçmeli', Icon: CheckSquare },
  { id: 'open', label: 'Açık Uçlu', Icon: FileText },
  { id: 'case', label: 'Olay Soruları', Icon: MessagesSquare },
  { id: 'flash', label: 'Flashcard', Icon: Layers },
  { id: 'memo', label: 'Madde Ezberleme', Icon: BookMarked },
] as const

export default function SinavPage() {
  const [active, setActive] = useState<typeof tabs[number]['id']>('multiple')
  const ActiveIcon = tabs.find(t => t.id === active)!.Icon

  return (
    <div className="page-fade">
      <PageHeader />

      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1.5">
          <GraduationCap className="w-[15px] h-[15px] text-[var(--primary)]" strokeWidth={1.75} />
          <h1 className="text-[22px] font-semibold tracking-tight">Sınav Modu</h1>
        </div>
        <p className="text-[12.5px] text-subtle">Kendinizi test etmek için farklı çalışma yöntemleri.</p>
      </div>

      <div className="surface p-1.5 flex gap-1 overflow-x-auto mb-4">
        {tabs.map(t => {
          const Icon = t.Icon
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[var(--primary)] text-white font-medium'
                  : 'text-muted hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="surface p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-4">
          <ActiveIcon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <span className="badge-soon">Yakında</span>
        <p className="text-[13px] font-semibold mt-3">{tabs.find(t => t.id === active)?.label}</p>
        <p className="text-[12px] text-subtle mt-1 max-w-md mx-auto leading-relaxed">
          Bu modül üzerinde çalışıyoruz. Çok yakında burada karşınızda olacak.
        </p>
      </div>
    </div>
  )
}
