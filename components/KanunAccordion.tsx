'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ColorScheme } from '@/lib/kanun-colors'

type Madde = {
  id: string
  madde_no: number
  path: string | null
  baslik: string | null
}

type Note = {
  id: string
  icerik: string
}

type TreeNode = {
  title: string
  children: Map<string, TreeNode>
  maddeler: Madde[]
}

function buildTree(maddeler: Madde[]): TreeNode {
  const root: TreeNode = { title: 'root', children: new Map(), maddeler: [] }
  for (const m of maddeler) {
    const parts = (m.path || '').split(' > ').filter(Boolean).slice(1)
    let node = root
    for (const part of parts) {
      if (!node.children.has(part)) {
        node.children.set(part, { title: part, children: new Map(), maddeler: [] })
      }
      node = node.children.get(part)!
    }
    node.maddeler.push(m)
  }
  return root
}

function countAll(node: TreeNode): number {
  return node.maddeler.length +
    Array.from(node.children.values()).reduce((s, c) => s + countAll(c), 0)
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) => {
    const score = (t: string) =>
      t.toLowerCase().includes('genel') ? -1 : t.toLowerCase().includes('özel') ? 1 : 0
    return score(a.title) - score(b.title)
  })
}

function Chevron({ open, cs }: { open: boolean; cs: ColorScheme }) {
  return (
    <svg
      className="w-3 h-3 shrink-0 transition-transform duration-200"
      style={{ color: open ? cs.primary : '#94a3b8', transform: open ? 'rotate(180deg)' : undefined }}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function MaddeCard({ m, cs, hasNote, isEven }: { m: Madde; cs: ColorScheme; hasNote: boolean; isEven?: boolean }) {
  const [metin, setMetin] = useState<string | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [maddeRes, userRes] = await Promise.all([
        supabase.from('maddeler').select('metin').eq('id', m.id).single(),
        supabase.auth.getUser(),
      ])
      if (cancelled) return
      setMetin(maddeRes.data?.metin || '')
      const user = userRes.data.user
      if (user) {
        setUserId(user.id)
        const noteRes = await supabase
          .from('notlar')
          .select('*')
          .eq('user_id', user.id)
          .eq('madde_id', Number(m.id))
          .maybeSingle()
        if (cancelled) return
        if (noteRes.data) {
          setNote(noteRes.data)
          setNoteText(noteRes.data.icerik)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [m.id])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [noteText, metin])

  async function handleSave() {
    if (!userId || !noteText.trim()) return
    setSaving(true)
    if (note) {
      await supabase
        .from('notlar')
        .update({ icerik: noteText, updated_at: new Date().toISOString() })
        .eq('id', note.id)
    } else {
      const { data } = await supabase
        .from('notlar')
        .insert({ madde_id: Number(m.id), icerik: noteText, user_id: userId })
        .select()
        .single()
      if (data) setNote(data)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      className={`rounded-lg border border-slate-200 px-4 py-3 ${isEven ? 'bg-white' : 'bg-slate-50'}`}
      style={{ borderLeftWidth: hasNote ? '2px' : '0.5px', borderLeftColor: hasNote ? cs.primary : 'transparent' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums card-pill"
          style={{ backgroundColor: cs.light, color: cs.primary }}
        >
          Madde {m.madde_no}
        </span>
        {m.baslik && (
          <span className="text-xs font-medium text-slate-700">{m.baslik}</span>
        )}
      </div>

      {metin === null ? (
        <div className="py-2 flex justify-center">
          <div
            className="w-3 h-3 rounded-full border-2 border-slate-200 animate-spin"
            style={{ borderTopColor: cs.primary }}
          />
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-700 leading-5 whitespace-pre-line mb-3">
            {metin}
          </p>

          <div className="border-t border-slate-100 pt-3">
            <textarea
              ref={textareaRef}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Not ekle..."
              rows={2}
              className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none resize-none overflow-hidden placeholder:text-slate-400 transition-shadow"
              onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${cs.primary}20` }}
              onBlur={e => { e.target.style.boxShadow = '' }}
            />
            {noteText.trim() && (
              <div className="flex items-center justify-end mt-1.5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-white text-[10px] font-semibold px-3 py-1 rounded-lg transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: cs.primary }}
                >
                  {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Section({ node, cs, noteSet, depth }: {
  node: TreeNode
  cs: ColorScheme
  noteSet: Set<string>
  depth: number
}) {
  const [open, setOpen] = useState(false)
  const total = countAll(node)
  const sortedChildren = sortNodes(Array.from(node.children.values()))

  if (depth === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden" style={{ borderLeftWidth: '3px', borderLeftColor: cs.primary }}>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="font-bold text-slate-900 text-xs leading-snug">{node.title}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 card-pill"
              style={{ backgroundColor: cs.light, color: cs.primary }}
            >
              {total} madde
            </span>
          </div>
          <Chevron open={open} cs={cs} />
        </button>

        {open && (
          <div className="border-t border-slate-100 p-2 space-y-2" style={{ backgroundColor: '#f2f2f7' }}>
            {sortedChildren.map(child => (
              <Section key={child.title} node={child} cs={cs} noteSet={noteSet} depth={1} />
            ))}
            {node.maddeler.length > 0 && (
              <div className="space-y-2">
                {node.maddeler.map((m, idx) => (
                  <MaddeCard key={m.id} m={m} cs={cs} hasNote={noteSet.has(String(m.id))} isEven={idx % 2 === 0} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-lg border border-slate-200 overflow-hidden"
      style={{ marginLeft: `${(depth - 1) * 8}px` }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left px-3 py-2 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`text-xs leading-snug ${depth === 1 ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
            {node.title}
          </span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 card-pill"
            style={{ backgroundColor: cs.light, color: cs.primary }}
          >
            {total}
          </span>
        </div>
        <Chevron open={open} cs={cs} />
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {sortedChildren.length > 0 && (
            <div className="p-1.5 space-y-2" style={{ backgroundColor: '#f2f2f7' }}>
              {sortedChildren.map(child => (
                <Section key={child.title} node={child} cs={cs} noteSet={noteSet} depth={depth + 1} />
              ))}
            </div>
          )}
          {node.maddeler.length > 0 && (
            <div className="space-y-2 p-2">
              {node.maddeler.map((m, idx) => (
                <MaddeCard key={m.id} m={m} cs={cs} hasNote={noteSet.has(String(m.id))} isEven={idx % 2 === 0} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function KanunAccordion({ maddeler, noteIds, colorScheme }: {
  maddeler: Madde[]
  kanunId: string
  noteIds: string[]
  colorScheme: ColorScheme
}) {
  const root = buildTree(maddeler)
  const sections = sortNodes(Array.from(root.children.values()))
  const noteSet = new Set(noteIds)

  return (
    <div className="space-y-2">
      {sections.map(s => (
        <Section key={s.title} node={s} cs={colorScheme} noteSet={noteSet} depth={0} />
      ))}
    </div>
  )
}
