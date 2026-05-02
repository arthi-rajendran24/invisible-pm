'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary that catches rendering errors in child components
 * and displays a friendly fallback UI instead of crashing the entire app.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center"
        >
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-rose-800 mb-2">Something went wrong</h3>
          <p className="text-sm text-rose-600 mb-4">
            {this.props.fallbackMessage || 'An unexpected error occurred while rendering the dashboard.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
