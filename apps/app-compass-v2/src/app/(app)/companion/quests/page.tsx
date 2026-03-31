/**
 * Companion Quests Page - Olcan Compass v2.5
 * Redirects to /aura/quests for now
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CompanionQuestsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/aura/quests')
  }, [router])

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center">
      <div className="text-sm text-text-muted">Redirecionando...</div>
    </div>
  )
}
