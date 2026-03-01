import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requirePsychProfile?: boolean
}

/**
 * Protected route wrapper
 * Redirects to login if not authenticated
 * Redirects to assessment if psych profile required but missing
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requirePsychProfile = false,
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore()
  const [hasPsychProfile, setHasPsychProfile] = useState<boolean | null>(null)

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    if (!requirePsychProfile) {
      setHasPsychProfile(null)
      return
    }

    if (!isAuthenticated) {
      setHasPsychProfile(null)
      return
    }

    let cancelled = false
    const run = async () => {
      try {
        await api.getPsychProfile()
        if (!cancelled) setHasPsychProfile(true)
      } catch {
        if (!cancelled) setHasPsychProfile(false)
      }
    }

    setHasPsychProfile(null)
    run()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, requirePsychProfile])

  if (requirePsychProfile && hasPsychProfile === null) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (requirePsychProfile && hasPsychProfile === false) {
    return <Navigate to="/assessment" replace />
  }

  return <>{children}</>
}
