'use client'

import { useEffect } from 'react'
import { addRecent, type RecentMadde } from '@/lib/recent-storage'

export default function RecordView(props: Omit<RecentMadde, 'openedAt'>) {
  useEffect(() => {
    addRecent({ ...props, openedAt: Date.now() })
  }, [props])
  return null
}
