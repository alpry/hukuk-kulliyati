'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import MaddeInlineView from './MaddeInlineView'
import FavoriteButton from './FavoriteButton'
import { createClient } from '@/lib/supabase/client'
import { normalizeTitle } from '@/lib/text-case'
import type { ColorScheme } from '@/lib/kanun-colors'

type Madde = {
  id: string
  madde_no: number
  path: string | null
  baslik: string | null
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

function nodeContains(node: TreeNode, target: string): boolean {
  if (node.title === target) return true
  for (const child of node.children.values()) {
    if (nodeContains(child, target)) return true
  }
  return false
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) => {
    const score = (t: string) =>
      t.toLowerCase().includes('genel') ? -1 : t.toLowerCase().includes('özel') ? 1 : 0
    return score(a.title) - score(b.title)
  })
}

function InlineMaddeNoteEditor({
  maddeId,
  existingNote,
  cs,
}: {
  maddeId: string
  existingNote: { id: string; icerik: string } | null
  cs: ColorScheme
}) {
  const [icerik, setIcerik] = useState(existingNote?.icerik || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const noteIdRef = useRef<string | null>(existingNote?.id || null)
  const [hasSavedNote, setHasSavedNote] = useState(!!existingNote)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [icerik])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    let error
    if (noteIdRef.current) {
      const res = await supabase
        .from('notlar')
        .update({ icerik, updated_at: new Date().toISOString() })
        .eq('id', noteIdRef.current)
      error = res.error
    } else {
      const res = await supabase
        .from('notlar')
        .insert({ madde_id: parseInt(maddeId), icerik, user_id: user.id })
        .select('id')
        .single()
      error = res.error
      if (!error && res.data) {
        noteIdRef.current = res.data.id
        setHasSavedNote(true)
      }
    }

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function handleDelete() {
    if (!noteIdRef.current) return
    await supabase.from('notlar').delete().eq('id', noteIdRef.current)
    setIcerik('')
    noteIdRef.current = null
    setHasSavedNote(false)
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={icerik}
        onChange={e => setIcerik(e.target.value)}
        placeholder="Bu madde için notunuzu buraya yazın..."
        rows={1}
        className="w-full text-[12px] bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 resize-none overflow-hidden focus:outline-none transition-shadow"
        style={{ minHeight: '36px' }}
        onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${cs.primary}30` }}
        onBlur={e => { e.target.style.boxShadow = '' }}
      />
      <div className="flex items-center justify-between">
        {hasSavedNote && icerik ? (
          <button onClick={handleDelete} className="text-[10px] text-subtle hover:text-red-500 transition-colors">
            Notu Sil
          </button>
        ) : <span />}
        <button
          onClick={handleSave}
          disabled={saving || !icerik.trim()}
          className="text-[11px] font-medium px-3 py-1 rounded-lg text-white disabled:opacity-40 transition-all"
          style={{ backgroundColor: cs.primary }}
        >
          {saving ? 'Kaydediliyor…' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}

function InlineMaddeContent({ madde, kanunId, cs }: {
  madde: Madde
  kanunId: string
  cs: ColorScheme
}) {
  const [detail, setDetail] = useState<{ metin: string; note: { id: string; icerik: string } | null; isFav: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const [maddeRes, { data: { user } }] = await Promise.all([
        supabase.from('maddeler').select('metin').eq('id', madde.id).single(),
        supabase.auth.getUser(),
      ])
      let note = null
      let isFav = false
      if (user) {
        const [noteRes, favRes] = await Promise.all([
          supabase.from('notlar').select('id, icerik').eq('user_id', user.id).eq('madde_id', Number(madde.id)).maybeSingle(),
          supabase.from('favoriler').select('id').eq('user_id', user.id).eq('madde_id', Number(madde.id)).maybeSingle(),
        ])
        note = noteRes.data
        isFav = !!favRes.data
      }
      if (!cancelled) {
        setDetail({ metin: maddeRes.data?.metin || '', note, isFav })
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [madde.id])

  if (loading) {
    return <p className="text-[12px] text-subtle py-3 text-center">Yükleniyor…</p>
  }
  if (!detail) return null

  return (
    <div className="px-3 py-3 space-y-3 bg-[var(--background)]">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/kanun/${kanunId}/madde/${madde.id}`}
          className="text-[10px] font-bold px-2 py-0.5 rounded-full card-pill tabular-nums leading-none hover:opacity-80 transition-opacity"
          style={{ backgroundColor: cs.light, color: cs.primary }}
        >
          Madde {madde.madde_no}
        </Link>
        <FavoriteButton maddeId={Number(madde.id)} initial={detail.isFav} />
      </div>
      <p className="text-[13px] leading-7 whitespace-pre-line">{detail.metin}</p>
      <InlineMaddeNoteEditor
        maddeId={madde.id}
        existingNote={detail.note}
        cs={cs}
      />
    </div>
  )
}

function Chevron({ open, cs }: { open: boolean; cs: ColorScheme }) {
  return (
    <ChevronDown
      className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
      style={{ color: open ? cs.primary : 'var(--foreground-subtle)', transform: open ? 'rotate(180deg)' : undefined }}
      strokeWidth={2}
    />
  )
}

function Section({ node, cs, noteSet, kanunId, depth, expandedSection }: {
  node: TreeNode
  cs: ColorScheme
  noteSet: Set<string>
  kanunId: string
  depth: number
  expandedSection?: string | null
}) {
  const [open, setOpen] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const target = expandedSection || undefined
  const shouldOpen = target ? nodeContains(node, target) : false
  const isTarget = target === node.title

  useEffect(() => {
    if (shouldOpen) setOpen(true)
  }, [shouldOpen])

  useEffect(() => {
    if (isTarget && open) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isTarget, open])

  const total = countAll(node)
  const sortedChildren = sortNodes(Array.from(node.children.values()))

  if (depth === 0) {
    return (
      <div
        ref={sectionRef}
        className="surface overflow-hidden"
        style={{ borderLeftWidth: '3px', borderLeftColor: cs.primary }}
      >
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-[var(--surface-muted)] transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="font-bold text-[12.5px] leading-snug">{normalizeTitle(node.title)}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full card-pill shrink-0"
              style={{ backgroundColor: cs.light, color: cs.primary }}
            >
              {total} madde
            </span>
          </div>
          <Chevron open={open} cs={cs} />
        </button>

        {open && (
          <div className="border-t border-[var(--border)] p-2 space-y-1.5 bg-[var(--background)]">
            {sortedChildren.map(child => (
              <Section key={child.title} node={child} cs={cs} noteSet={noteSet} kanunId={kanunId} depth={1} expandedSection={expandedSection} />
            ))}
            {node.maddeler.length > 0 && (
              <div className="space-y-0.5 p-1">
                {node.maddeler.map(m => (
                  <MaddeInlineView
                    key={m.id}
                    kanunId={kanunId}
                    maddeId={m.id}
                    maddeNo={m.madde_no}
                    baslik={m.baslik}
                    path={m.path}
                    cs={cs}
                    hasNote={noteSet.has(String(m.id))}
                  />
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
      ref={sectionRef}
      className="surface overflow-hidden"
      style={{ marginLeft: `${(depth - 1) * 8}px` }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left px-3 py-2 hover:bg-[var(--surface-muted)] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`text-[12px] leading-snug ${depth === 1 ? 'font-semibold' : 'font-medium text-muted'}`}>
            {normalizeTitle(node.title)}
          </span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full card-pill shrink-0"
            style={{ backgroundColor: cs.light, color: cs.primary }}
          >
            {total}
          </span>
        </div>
        <Chevron open={open} cs={cs} />
      </button>

      {open && (
        <div className="border-t border-[var(--border)]">
          {sortedChildren.length > 0 && (
            <div className="p-1.5 space-y-1.5 bg-[var(--background)]">
              {sortedChildren.map(child => (
                <Section key={child.title} node={child} cs={cs} noteSet={noteSet} kanunId={kanunId} depth={depth + 1} expandedSection={expandedSection} />
              ))}
            </div>
          )}
          {node.maddeler.length > 0 && (
            sortedChildren.length === 0 && node.maddeler.length === 1 ? (
              <InlineMaddeContent madde={node.maddeler[0]} kanunId={kanunId} cs={cs} />
            ) : (
              <div className="space-y-0.5 p-1.5">
                {node.maddeler.map(m => (
                  <MaddeInlineView
                    key={m.id}
                    kanunId={kanunId}
                    maddeId={m.id}
                    maddeNo={m.madde_no}
                    baslik={m.baslik}
                    path={m.path}
                    cs={cs}
                    hasNote={noteSet.has(String(m.id))}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function KanunAccordion({ maddeler, kanunId, noteIds, colorScheme, expandedSection }: {
  maddeler: Madde[]
  kanunId: string
  noteIds: string[]
  colorScheme: ColorScheme
  expandedSection?: string | null
}) {
  const root = buildTree(maddeler)
  const sections = sortNodes(Array.from(root.children.values()))
  const noteSet = new Set(noteIds)

  return (
    <div className="space-y-2">
      {sections.map(s => (
        <Section
          key={s.title}
          node={s}
          cs={colorScheme}
          noteSet={noteSet}
          kanunId={kanunId}
          depth={0}
          expandedSection={expandedSection}
        />
      ))}
      {root.maddeler.length > 0 && (
        <div className="surface overflow-hidden divide-y divide-[var(--border)]">
          {root.maddeler.map(m => (
            <MaddeInlineView
              key={m.id}
              kanunId={kanunId}
              maddeId={m.id}
              maddeNo={m.madde_no}
              baslik={m.baslik}
              path={m.path}
              cs={colorScheme}
              hasNote={noteSet.has(String(m.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
