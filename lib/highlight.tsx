function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function Highlight({ text, query }: { text: string; query?: string }) {
  const q = query?.trim()
  if (!q) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegex(q)})`, 'gi'))
  const lower = q.toLowerCase()
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lower ? (
          <mark key={i} className="bg-yellow-100 text-yellow-900 rounded-[3px] px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export function snippet(text: string, query: string, before = 80, after = 140): string {
  const q = query.trim()
  const max = before + after
  if (!q) return text.length > max ? text.slice(0, max) + '…' : text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text.length > max ? text.slice(0, max) + '…' : text
  const start = Math.max(0, idx - before)
  const end = Math.min(text.length, idx + q.length + after)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}
