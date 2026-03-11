"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Generic error boundary for engine sections.
 * Catches render errors in child trees and shows a recoverable fallback.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-clay-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-clay-500" />
          </div>
          <h3 className="font-heading text-h4 text-text-primary mb-1">
            {this.props.fallbackTitle || "Algo deu errado"}
          </h3>
          <p className="text-body-sm text-text-secondary max-w-sm mx-auto mb-4">
            {this.props.fallbackDescription || "Ocorreu um erro inesperado. Tente novamente."}
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="text-left text-[11px] bg-cream-100 p-3 rounded-lg mb-4 overflow-x-auto text-clay-600 max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-moss-500 text-white font-heading font-semibold text-body-sm hover:bg-moss-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
