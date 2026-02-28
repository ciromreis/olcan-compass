import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import { api } from './lib/api'
import { Layout } from './components/Layout'
import { SkipLink } from './components/ui/SkipLink'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NotFound } from './pages/NotFound'

// Eager load auth pages (small, needed immediately)
import { Login } from './pages/Login'
import { Register } from './pages/Register'

// Eager load auth recovery pages to avoid dynamic import fetch issues in dev
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { VerifyEmail } from './pages/VerifyEmail'

// Lazy load feature pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Assessment = lazy(() => import('./pages/Assessment').then(m => ({ default: m.Assessment })))

// Psychology
const PsychologyDashboard = lazy(() => import('./pages/Psychology/Dashboard').then(m => ({ default: m.PsychologyDashboard })))
const PsychologyAssessment = lazy(() => import('./pages/Psychology/Assessment').then(m => ({ default: m.Assessment })))

// Routes
const MyRoutes = lazy(() => import('./pages/Routes/MyRoutes').then(m => ({ default: m.MyRoutes })))
const RouteTemplates = lazy(() => import('./pages/Routes/Templates').then(m => ({ default: m.RouteTemplates })))

// Narratives
const NarrativesDashboard = lazy(() => import('./pages/Narratives/Dashboard').then(m => ({ default: m.NarrativesDashboard })))
const NarrativeEditorPage = lazy(() => import('./pages/Narratives/Editor').then(m => ({ default: m.NarrativeEditorPage })))

// Interviews
const QuestionBank = lazy(() => import('./pages/Interviews/QuestionBank').then(m => ({ default: m.QuestionBank })))
const InterviewSession = lazy(() => import('./pages/Interviews/Session').then(m => ({ default: m.InterviewSession })))

// Applications (uses nested routing internally)
const ApplicationsRouter = lazy(() => import('./pages/Applications/index'))

// Sprints
const MySprints = lazy(() => import('./pages/Sprints/MySprints').then(m => ({ default: m.MySprints })))
const SprintTemplates = lazy(() => import('./pages/Sprints/Templates').then(m => ({ default: m.SprintTemplates })))
const SprintDetail = lazy(() => import('./pages/Sprints/Detail').then(m => ({ default: m.SprintDetail })))

// Marketplace
const MarketplaceBrowse = lazy(() => import('./pages/Marketplace/Browse').then(m => ({ default: m.MarketplaceBrowse })))
const ProviderProfile = lazy(() => import('./pages/Marketplace/ProviderProfile').then(m => ({ default: m.ProviderProfile })))
const MyBookings = lazy(() => import('./pages/Marketplace/MyBookings').then(m => ({ default: m.MyBookings })))
const Messages = lazy(() => import('./pages/Marketplace/Messages').then(m => ({ default: m.Messages })))

// Constraints
const ConstraintsSettings = lazy(() => import('./pages/Constraints/Settings').then(m => ({ default: m.ConstraintsSettings })))
const PrunedOpportunities = lazy(() => import('./pages/Constraints/PrunedOpportunities').then(m => ({ default: m.PrunedOpportunities })))

// More
const MoreHub = lazy(() => import('./pages/More').then(m => ({ default: m.MoreHub })))

// Admin
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard').then(m => ({ default: m.AdminDashboard })))
const AdminUsers = lazy(() => import('./pages/Admin/Users').then(m => ({ default: m.AdminUsers })))
const ContentManagement = lazy(() => import('./pages/Admin/ContentManagement').then(m => ({ default: m.ContentManagement })))

/**
 * Root application component.
 * Handles auth initialization, psych profile check, and full route structure.
 */
function App() {
  const { isAuthenticated, setUser, setAuthenticated, setLoading, isLoading } = useAuthStore()
  const [hasPsychProfile, setHasPsychProfile] = useState<boolean | null>(null)

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setAuthenticated(false)
        setHasPsychProfile(null)
        setLoading(false)
        return
      }

      try {
        const user = await api.getProfile()
        setUser(user)
        setAuthenticated(true)

        // Check if user has completed psychological assessment
        try {
          await api.getPsychProfile()
          setHasPsychProfile(true)
        } catch {
          setHasPsychProfile(false)
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        setUser(null)
        setAuthenticated(false)
        setHasPsychProfile(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [setUser, setAuthenticated, setLoading])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated && hasPsychProfile === null) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Loading fallback for lazy-loaded routes
  const RouteLoadingFallback = (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <ErrorBoundary>
      <SkipLink href="#main-content">Pular para o conteúdo principal</SkipLink>
      <Suspense fallback={RouteLoadingFallback}>
        <Routes>
          {/* ── Public Routes ── */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
          />
          <Route
            path="/forgot-password"
            element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" replace />}
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />
          <Route
            path="/verify-email/:token"
            element={<VerifyEmail />}
          />

          {/* ── Onboarding Assessment — protected, full-screen (no sidebar) ── */}
          <Route
            path="/assessment"
            element={
              isAuthenticated
                ? <Assessment />
                : <Navigate to="/login" replace />
            }
          />

          {/* ── Protected Routes with Layout ── */}
          <Route
            element={
              !isAuthenticated
                ? <Navigate to="/login" replace />
                : hasPsychProfile === false
                  ? <Navigate to="/assessment" replace />
                  : <Layout />
            }
          >
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Psychology Engine */}
            <Route path="/psychology" element={<PsychologyDashboard />} />
            <Route path="/psychology/assessment" element={<PsychologyAssessment />} />

            {/* Route Planning */}
            <Route path="/routes" element={<MyRoutes />} />
            <Route path="/routes/templates" element={<RouteTemplates />} />

            {/* Narratives */}
            <Route path="/narratives" element={<NarrativesDashboard />} />
            <Route path="/narratives/:id" element={<NarrativeEditorPage />} />

            {/* Interviews */}
            <Route path="/interviews" element={<QuestionBank />} />
            <Route path="/interviews/session/:id" element={<InterviewSession />} />

            {/* Applications (nested routing inside) */}
            <Route path="/applications/*" element={<ApplicationsRouter />} />

            {/* Sprints */}
            <Route path="/sprints" element={<MySprints />} />
            <Route path="/sprints/templates" element={<SprintTemplates />} />
            <Route path="/sprints/:id" element={<SprintDetail />} />

            {/* Marketplace */}
            <Route path="/marketplace" element={<MarketplaceBrowse />} />
            <Route path="/marketplace/provider/:id" element={<ProviderProfile />} />
            <Route path="/marketplace/bookings" element={<MyBookings />} />
            <Route path="/marketplace/messages" element={<Messages />} />

            {/* Constraints */}
            <Route path="/constraints" element={<ConstraintsSettings />} />
            <Route path="/constraints/opportunities" element={<PrunedOpportunities />} />

            {/* More */}
            <Route path="/more" element={<MoreHub />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/content" element={<ContentManagement />} />
          </Route>

          {/* ── Catch-all 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
