import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Global error boundary component
 * Catches React errors and displays user-friendly fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-800/80 backdrop-blur-lg border border-neutral-700 rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>

            <h1 className="text-h2 font-heading text-white mb-2">
              Algo deu errado
            </h1>

            <p className="text-body text-neutral-300 mb-6">
              Desculpe, encontramos um erro inesperado. Nossa equipe foi notificada e
              estamos trabalhando para resolver o problema.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-neutral-900 rounded-lg text-left">
                <p className="text-caption font-mono text-error mb-2">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                <pre className="text-caption font-mono text-neutral-400 overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="secondary">
                Recarregar Página
              </Button>
              <Button onClick={this.handleReset}>
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
