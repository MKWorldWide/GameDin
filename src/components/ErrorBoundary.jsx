import React, { Component } from 'react';

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree.
 * Displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return this.props.fallback || <div>Something went wrong. Please try again.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 