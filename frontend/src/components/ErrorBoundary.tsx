import { motion } from 'framer-motion';
import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Interface for ErrorBoundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Interface for ErrorBoundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree.
 * Displays a fallback UI instead of crashing the whole app.
 *
 * Features:
 * - Catches JavaScript errors in child components
 * - Logs errors for debugging
 * - Displays customizable fallback UI with animations
 * - Prevents app crashes from component errors
 * - Provides error recovery options
 *
 * Usage:
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Static method to update state when an error occurs
   * @param error - The error that was thrown
   * @returns New state object with error information
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called when an error is caught
   * @param error - The error that was thrown
   * @param errorInfo - Additional error information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In a production environment, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    this.setState({ errorInfo });
  }

  /**
   * Reset the error state when trying to recover
   */
  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  /**
   * Handle page refresh as a fallback recovery method
   */
  private handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with enhanced styling and animations
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
              <div className="flex gap-2">
                <button
                  onClick={this.handleReset}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label="Try again"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleRefresh}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  aria-label="Refresh the page"
                >
                  Refresh Page
                </button>
              </div>
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
