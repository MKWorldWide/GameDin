/**
 * @file Error Boundary Component
 * @description A reusable error boundary component for the analytics dashboard
 * @version 1.0.0
 * @module components/analytics/ErrorBoundary
 */

import React, { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { BugReport as BugReportIcon, Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Props for the ErrorBoundary component
 * @interface ErrorBoundaryProps
 * @property {ReactNode} children - The child components to be wrapped by the error boundary
 * @property {string} [componentName] - The name of the component where the error occurred
 * @property {() => void} [onReset] - Callback function to reset the error state
 * @property {ReactNode} [fallback] - Custom fallback UI to render when an error occurs
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  onReset?: () => void;
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component
 * @interface ErrorBoundaryState
 * @property {boolean} hasError - Whether an error has been caught
 * @property {Error | null} error - The error that was caught
 * @property {ErrorInfo | null} errorInfo - Additional error information
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * @component
 * @example
 * // Basic usage
 * <ErrorBoundary componentName="AnalyticsDashboard">
 *   <AnalyticsDashboard />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary 
 *   componentName="AnalyticsDashboard"
 *   fallback={
 *     <div>Custom error message</div>
 *   }
 * >
 *   <AnalyticsDashboard />
 * </ErrorBoundary>
 *
 * @description
 * A reusable error boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * Key Features:
 * - Catches errors in child components
 * - Displays a user-friendly error message
 * - Provides error details for debugging
 * - Supports custom fallback UI
 * - Allows resetting the error state
 * - Integrates with the application's theme
 * 
 * @param {ErrorBoundaryProps} props - The component props
 * @returns {React.ReactElement} The rendered ErrorBoundary component
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * Initialize the error boundary state
   */
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  /**
   * Update state when an error is caught
   * @param {Error} error - The error that was thrown
   * @returns {ErrorBoundaryState} The updated state
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: null,
    };
  }

  /**
   * Handle component errors
   * @param {Error} error - The error that was thrown
   * @param {ErrorInfo} errorInfo - Information about which component threw the error
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error(`[${this.props.componentName || 'ErrorBoundary'}] Error:`, error, errorInfo);
    
    // Update state with error information
    this.setState({
      error,
      errorInfo,
    });
  }

  /**
   * Reset the error state and call the onReset callback if provided
   */
  private handleReset = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Render the component
   * @returns {React.ReactNode} The rendered component
   */
  public render(): React.ReactNode {
    // If there's no error, render the children
    if (!this.state.hasError) {
      return this.props.children;
    }

    // If a custom fallback is provided, render it
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Otherwise, render the default error UI
    return (
      <ErrorBoundaryFallback
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        componentName={this.props.componentName}
        onReset={this.handleReset}
      />
    );
  }
}

/**
 * Props for the ErrorBoundaryFallback component
 * @interface ErrorBoundaryFallbackProps
 * @property {Error | null} error - The error that was caught
 * @property {ErrorInfo | null} errorInfo - Additional error information
 * @property {string} [componentName] - The name of the component where the error occurred
 * @property {() => void} [onReset] - Callback function to reset the error state
 */
interface ErrorBoundaryFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  componentName?: string;
  onReset?: () => void;
}

/**
 * ErrorBoundaryFallback Component
 * 
 * @component
 * @description
 * The default fallback UI for the ErrorBoundary component.
 * Displays an error message and provides options to reset the error state.
 * 
 * @param {ErrorBoundaryFallbackProps} props - The component props
 * @returns {React.ReactElement} The rendered ErrorBoundaryFallback component
 */
const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  errorInfo,
  componentName,
  onReset,
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Paper 
      elevation={2}
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        my: 4,
        textAlign: 'center',
        borderLeft: `4px solid ${theme.palette.error.main}`,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <BugReportIcon 
          color="error" 
          sx={{ fontSize: 60, opacity: 0.8 }} 
        />
      </Box>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Oops! Something went wrong
      </Typography>
      
      {componentName && (
        <Typography color="text.secondary" paragraph>
          An error occurred in the <strong>{componentName}</strong> component.
        </Typography>
      )}
      
      <Typography paragraph>
        We're sorry for the inconvenience. The error has been logged and our team has been notified.
      </Typography>
      
      <Box sx={{ mt: 3, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onReset}
          sx={{ mr: 2 }}
        >
          Try Again
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </Box>
      
      {showDetails && error && (
        <Box 
          component="pre" 
          sx={{
            mt: 3,
            p: 2,
            textAlign: 'left',
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            overflowX: 'auto',
            fontSize: '0.8rem',
            color: theme.palette.error.main,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {error.name}: {error.message}
          </Typography>
          
          {error.stack && (
            <Box component="code" sx={{ whiteSpace: 'pre-wrap' }}>
              {error.stack}
            </Box>
          )}
          
          {errorInfo?.componentStack && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Component Stack:
              </Typography>
              <Box component="code" sx={{ whiteSpace: 'pre-wrap' }}>
                {errorInfo.componentStack}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ErrorBoundary;
