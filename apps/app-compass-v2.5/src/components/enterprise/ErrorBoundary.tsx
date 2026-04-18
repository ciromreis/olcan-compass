// Enterprise-Grade Error Boundary
// Comprehensive error handling with fallback UI and error reporting

import React, { Component, ErrorInfo, ReactNode, useCallback } from 'react';
import { Button, Card } from '@/components/ui';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  showHome?: boolean;
  customMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  maxRetries: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      maxRetries: 3
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to error tracking service
    this.logError(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to monitoring service
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Sentry) {
      const sentry = (window as unknown as Record<string, unknown>).Sentry as {
        captureException: (error: Error, options?: { tags?: Record<string, string>; extra?: Record<string, unknown> }) => void;
      };
      sentry.captureException(error, {
        tags: { component: 'ErrorBoundary' },
        extra: { componentStack: errorInfo.componentStack }
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  componentWillUnmount() {
    // Clean up any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      retryCount: this.state.retryCount
    };

    // Send to error logging service
    this.sendErrorToService(errorData);
  };

  private sendErrorToService = (errorData: Record<string, unknown>) => {
    // Send to your error service (Sentry, LogRocket, etc.)
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Silently fail if error service is unavailable
      });
    } catch {
      // Silently fail if error service is unavailable
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.state.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));

      // Clear error after a short delay
      const timeout = setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);

      this.retryTimeouts.push(timeout);
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    // Determine error severity based on error characteristics
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'medium'; // Network-related, usually recoverable
    }
    
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'medium'; // Network error
    }
    
    if (error.name === 'TypeError' && error.message.includes('null')) {
      return 'high'; // Null reference, potential data issue
    }
    
    if (error.name === 'ReferenceError') {
      return 'critical'; // Reference error, likely code issue
    }
    
    return 'low'; // Default severity
  };

  private getErrorMessage = (error: Error): string => {
    const severity = this.getErrorSeverity(error);
    
    if (this.props.customMessage) {
      return this.props.customMessage;
    }

    switch (severity) {
      case 'low':
        return 'Ocorreu um pequeno problema. Tente novamente.';
      case 'medium':
        return 'Estamos com dificuldades técnicas. Tente recarregar a página.';
      case 'high':
        return 'Ocorreu um erro inesperado. Nossa equipe foi notificada.';
      case 'critical':
        return 'O sistema está temporariamente indisponível. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  };

  private getErrorIcon = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    return <AlertTriangle className={`w-12 h-12 ${
      severity === 'critical' ? 'text-red-500' :
      severity === 'high' ? 'text-slate-500' :
      severity === 'medium' ? 'text-slate-500' :
      'text-blue-500'
    }`} />;
  };

  private canRetry = (): boolean => {
    return this.state.retryCount < this.state.maxRetries && this.props.showRetry !== false;
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const severity = this.getErrorSeverity(this.state.error!);
      const message = this.getErrorMessage(this.state.error!);

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="mb-4">
              {this.getErrorIcon(severity)}
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h1>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {this.state.retryCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Tentativa {this.state.retryCount} de {this.state.maxRetries}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.canRetry() && (
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </Button>
              )}
              
              {this.props.showHome !== false && (
                <Button 
                  variant="secondary" 
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Página Inicial
                </Button>
              )}
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for error reporting
export function useErrorReporting() {
  const reportError = useCallback((error: Error, context?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Sentry) {
      const sentry = (window as unknown as Record<string, unknown>).Sentry as {
        captureException: (error: Error, options?: { extra?: Record<string, unknown> }) => void;
      };
      sentry.captureException(error, {
        extra: context
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Reported error:', error, context);
    }
  }, []);

  const reportMessage = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'error') => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Sentry) {
      const sentry = (window as unknown as Record<string, unknown>).Sentry as {
        captureMessage: (message: string, level: string) => void;
      };
      sentry.captureMessage(message, level);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'warning' ? 'warn' : level;
      console[consoleMethod](message);
    }
  }, []);

  return { reportError, reportMessage };
}

export default ErrorBoundary;
