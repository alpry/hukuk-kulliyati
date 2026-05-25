'use client'

import { useState } from 'react'
import Link from 'next/link'

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

function Section({ node, kanunId, depth }: {
  node: TreeNode
  kanunId: string
  depth: number
}) {
  const [open, setOpen] = useState(depth === 0)
  const total = countAll(node)
  const indent = depth * 16

  return (
    <div className={depth === 0 ? 'bg-white rounded-xl border border-gray-200 overflow-hidden' : 'border-t border-gray-100'}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left transition-colors hover:bg-gray-50"
        style={{ paddingLeft: `${20 + indent}px`, paddingRight: '20px', paddingTop: depth === 0 ? '16px' : '10px', paddingBottom: depth === 0 ? '16px' : '10px' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`text-sm leading-snug truncate ${depth === 0 ? 'font-semibold text-gray-900' : depth === 1 ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
            {node.title}
          </span>
          <span className="text-xs text-gray-400 shrink-0">{total} madde</span>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 ml-2 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={depth === 0 ? 'border-t border-gray-100' : ''}>
          {Array.from(node.children.values()).map(child => (
            <Section key={child.title} node={child} kanunId={kanunId} depth={depth + 1} />
          ))}
          {node.maddeler.map(m => (
            <MaddeRow key={m.id} m={m} kanunId={kanunId} indent={indent + 16} />
          ))}
        </div>
      )}
    </div>
  )
}

function MaddeRow({ m, kanunId, indent }: { m: Madde; kanunId: string; indent: number }) {
  return (
    <Link
      href={`/dashboard/kanun/${kanunId}/madde/${m.id}`}
      className="flex items-center justify-between py-2.5 border-t border-gray-50 hover:bg-blue-50 transition-colors group"
      style={{ paddingLeft: `${20 + indent}px`, paddingRight: '20px' }}
    >
      <span className="text-xs font-mono font-semibold text-blue-600">
        Madde {m.madde_no}
      </span>
      <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export default function KanunAccordion({ maddeler, kanunId }: { maddeler: Madde[]; kanunId: string }) {
  const root = buildTree(maddeler)
  const sections = Array.from(root.children.values())

  return (
    <div className="space-y-2">
      {sections.map(s => (
        <Section key={s.title} node={s} kanunId={kanunId} depth={0} />
      ))}
    </div>
  )
}
