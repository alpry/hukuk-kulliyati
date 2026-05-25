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
      className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
      style={{ color: open ? cs.primary : '#94a3b8', transform: open ? 'rotate(180deg)' : undefined }}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ExpandedMadde({ m, cs }: { m: Madde; cs: ColorScheme }) {
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

  if (metin === null) {
    return (
      <div className="px-4 py-5 flex justify-center">
        <div
          className="w-5 h-5 rounded-full border-2 border-slate-100 animate-spin"
          style={{ borderTopColor: cs.primary }}
        />
      </div>
    )
  }

  return (
    <div className="px-4 pb-5">
      <p className="text-sm text-slate-700 leading-8 whitespace-pre-line mb-5 pt-1">
        {metin}
      </p>

      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5 mb-2">
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: cs.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-xs font-semibold text-slate-600">Notlarım</span>
        </div>

        <textarea
          ref={textareaRef}
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Bu madde için not ekle..."
          rows={3}
          className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none resize-none overflow-hidden placeholder:text-slate-400 transition-shadow"
          onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${cs.primary}28` }}
          onBlur={e => { e.target.style.boxShadow = '' }}
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">{noteText.length} karakter</span>
          <button
            onClick={handleSave}
            disabled={saving || !noteText.trim()}
            className="text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-opacity disabled:opacity-40"
            style={{ backgroundColor: cs.primary }}
          >
            {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MaddeRow({ m, cs, hasNote }: { m: Madde; cs: ColorScheme; hasNote: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="border-l-2 transition-colors"
      style={{ borderLeftColor: hasNote ? cs.primary : 'transparent' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left hover:bg-slate-50"
        style={open ? { backgroundColor: `${cs.light}` } : undefined}
      >
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 tabular-nums"
          style={{ backgroundColor: cs.light, color: cs.primary }}
        >
          Madde {m.madde_no}
        </span>
        {m.baslik && (
          <span className="text-sm text-slate-600 flex-1 leading-snug">{m.baslik}</span>
        )}
        <Chevron open={open} cs={cs} />
      </button>

      {open && <ExpandedMadde m={m} cs={cs} />}
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
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between text-left px-5 py-4 hover:bg-slate-50/70 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="font-semibold text-slate-900 text-sm leading-snug">{node.title}</span>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: cs.light, color: cs.primary }}
            >
              {total} madde
            </span>
          </div>
          <Chevron open={open} cs={cs} />
        </button>

        {open && (
          <div className="border-t border-slate-100 bg-slate-50/70 p-3 space-y-2">
            {sortedChildren.map(child => (
              <Section key={child.title} node={child} cs={cs} noteSet={noteSet} depth={1} />
            ))}
            {node.maddeler.length > 0 && (
              <div className="bg-white rounded-xl ring-1 ring-black/5 overflow-hidden divide-y divide-slate-50">
                {node.maddeler.map(m => (
                  <MaddeRow key={m.id} m={m} cs={cs} hasNote={noteSet.has(String(m.id))} />
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
      className="bg-white rounded-xl ring-1 ring-black/5 overflow-hidden"
      style={{ marginLeft: `${(depth - 1) * 12}px` }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`text-sm leading-snug ${depth === 1 ? 'font-medium text-slate-800' : 'text-slate-700'}`}>
            {node.title}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: cs.light, color: cs.primary }}
          >
            {total} madde
          </span>
        </div>
        <Chevron open={open} cs={cs} />
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {sortedChildren.length > 0 && (
            <div className="p-2 space-y-1.5 bg-slate-50/50">
              {sortedChildren.map(child => (
                <Section key={child.title} node={child} cs={cs} noteSet={noteSet} depth={depth + 1} />
              ))}
            </div>
          )}
          {node.maddeler.length > 0 && (
            <div className="divide-y divide-slate-50">
              {node.maddeler.map(m => (
                <MaddeRow key={m.id} m={m} cs={cs} hasNote={noteSet.has(String(m.id))} />
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
