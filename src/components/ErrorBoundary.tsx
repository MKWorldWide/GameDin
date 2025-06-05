import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child
 * component tree and display a fallback UI instead of the component tree that crashed.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  /**
   * Update state so the next render will show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log error information for debugging.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Here you could also log to an error reporting service like Sentry
    // example: Sentry.captureException(error);
  }

  /**
   * Reset the error state when trying to recover
   */
  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-red-600 p-4">
              <h2 className="text-white text-xl font-bold">Something went wrong</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </p>
              {this.state.error && (
                <div className="bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-32">
                  <code className="text-sm text-red-600">{this.state.error.toString()}</code>
                </div>
              )}
              <button
                onClick={this.handleReset}
                className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                aria-label="Try again"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 