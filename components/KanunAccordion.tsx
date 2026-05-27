'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import MaddeInlineView from './MaddeInlineView'
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
