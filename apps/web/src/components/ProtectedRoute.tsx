import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

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
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore()

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // TODO: Add psych profile check when needed
  // if (requirePsychProfile && !hasPsychProfile) {
  //   return <Navigate to="/psychology/assessment" replace />
  // }

  return <>{children}</>
}
