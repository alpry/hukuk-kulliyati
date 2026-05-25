'use client'

import { useState } from 'react'
import Link from 'next/link'
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

function MaddeRow({ m, kanunId, cs, hasNote }: {
  m: Madde
  kanunId: string
  cs: ColorScheme
  hasNote: boolean
}) {
  return (
    <Link
      href={`/dashboard/kanun/${kanunId}/madde/${m.id}`}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group border-l-2"
      style={{ borderLeftColor: hasNote ? cs.primary : 'transparent' }}
    >
      <span
        className="text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 tabular-nums"
        style={{ backgroundColor: cs.light, color: cs.primary }}
      >
        Madde {m.madde_no}
      </span>
      {m.baslik && (
        <span className="text-sm text-slate-600 flex-1 truncate">{m.baslik}</span>
      )}
      <svg
        className="w-3.5 h-3.5 shrink-0 ml-auto text-slate-300 group-hover:text-slate-400 transition-colors"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </Link>
  )
}

function Section({ node, kanunId, cs, noteSet, depth }: {
  node: TreeNode
  kanunId: string
  cs: ColorScheme
  noteSet: Set<string>
  depth: number
}) {
  const [open, setOpen] = useState(depth === 0)
  const total = countAll(node)
  const hasChildren = node.children.size > 0
  const hasMaddeler = node.maddeler.length > 0

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
            {Array.from(node.children.values()).map(child => (
              <Section key={child.title} node={child} kanunId={kanunId} cs={cs} noteSet={noteSet} depth={1} />
            ))}
            {hasMaddeler && (
              <div className="bg-white rounded-xl ring-1 ring-black/5 overflow-hidden divide-y divide-slate-50">
                {node.maddeler.map(m => (
                  <MaddeRow key={m.id} m={m} kanunId={kanunId} cs={cs} hasNote={noteSet.has(String(m.id))} />
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
          {hasChildren && (
            <div className="p-2 space-y-1.5 bg-slate-50/50">
              {Array.from(node.children.values()).map(child => (
                <Section key={child.title} node={child} kanunId={kanunId} cs={cs} noteSet={noteSet} depth={depth + 1} />
              ))}
            </div>
          )}
          {hasMaddeler && (
            <div className="divide-y divide-slate-50">
              {node.maddeler.map(m => (
                <MaddeRow key={m.id} m={m} kanunId={kanunId} cs={cs} hasNote={noteSet.has(String(m.id))} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function KanunAccordion({ maddeler, kanunId, noteIds, colorScheme }: {
  maddeler: Madde[]
  kanunId: string
  noteIds: string[]
  colorScheme: ColorScheme
}) {
  const root = buildTree(maddeler)
  const sections = Array.from(root.children.values())
  const noteSet = new Set(noteIds)

  return (
    <div className="space-y-2">
      {sections.map(s => (
        <Section key={s.title} node={s} kanunId={kanunId} cs={colorScheme} noteSet={noteSet} depth={0} />
      ))}
    </div>
  )
}
