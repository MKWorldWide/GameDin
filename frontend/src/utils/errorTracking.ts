import { IApplicationError } from '../types/utilities';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  TYPE_ERROR = 'type_error',
  VALIDATION_ERROR = 'validation_error',
  API_ERROR = 'api_error',
  RUNTIME_ERROR = 'runtime_error',
}

interface ErrorContext {
  component?: string;
  file?: string;
  line?: number;
  userAction?: string;
  additionalData?: Record<string, unknown>;
}

interface ErrorMetrics {
  timestamp: number;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Map<string, ErrorMetrics[]>;
  private readonly MAX_ERRORS_PER_CATEGORY = 100;

  private constructor() {
    this.errors = new Map();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  public trackError(
    error: Error | IApplicationError,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context: ErrorContext,
  ): void {
    const errorMetrics: ErrorMetrics = {
      timestamp: Date.now(),
      category,
      severity,
      context,
    };

    const categoryErrors = this.errors.get(category) || [];

    // Implement circular buffer to prevent memory leaks
    if (categoryErrors.length >= this.MAX_ERRORS_PER_CATEGORY) {
      categoryErrors.shift();
    }

    categoryErrors.push(errorMetrics);
    this.errors.set(category, categoryErrors);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', {
        message: error.message,
        ...errorMetrics,
        stack: error.stack,
      });
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTrackingService(error, errorMetrics);
    }
  }

  public trackTypeError(error: Error, context: ErrorContext): void {
    this.trackError(error, ErrorCategory.TYPE_ERROR, ErrorSeverity.HIGH, context);
  }

  public trackValidationError(error: Error, context: ErrorContext): void {
    this.trackError(error, ErrorCategory.VALIDATION_ERROR, ErrorSeverity.MEDIUM, context);
  }

  public getErrorsByCategory(category: ErrorCategory): ErrorMetrics[] {
    return this.errors.get(category) || [];
  }

  public getErrorStats(): Record<ErrorCategory, number> {
    const stats: Record<ErrorCategory, number> = {
      [ErrorCategory.TYPE_ERROR]: 0,
      [ErrorCategory.VALIDATION_ERROR]: 0,
      [ErrorCategory.API_ERROR]: 0,
      [ErrorCategory.RUNTIME_ERROR]: 0,
    };

    this.errors.forEach((categoryErrors, category) => {
      stats[category as ErrorCategory] = categoryErrors.length;
    });

    return stats;
  }

  private sendToErrorTrackingService(
    error: Error | IApplicationError,
    metrics: ErrorMetrics,
  ): void {
    // Implementation would depend on your error tracking service (e.g., Sentry, LogRocket)
    // This is a placeholder for the actual implementation
    console.log('Sending to error tracking service:', {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: (error as IApplicationError).code,
        statusCode: (error as IApplicationError).statusCode,
        details: (error as IApplicationError).details,
      },
      metrics,
    });
  }

  public clearErrors(): void {
    this.errors.clear();
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Utility functions for common error tracking scenarios
export const trackTypeValidationError = (
  component: string,
  expectedType: string,
  receivedValue: unknown,
): void => {
  errorTracker.trackTypeError(new TypeError(`Type validation failed in ${component}`), {
    component,
    additionalData: {
      expectedType,
      receivedValue,
      valueType: typeof receivedValue,
    },
  });
};

export const trackPromiseError = (error: Error, context: string): void => {
  errorTracker.trackError(error, ErrorCategory.RUNTIME_ERROR, ErrorSeverity.HIGH, {
    component: context,
    additionalData: {
      isPromiseError: true,
      asyncStackTrace: error.stack,
    },
  });
};

export const trackApiError = (error: Error | IApplicationError, endpoint: string): void => {
  errorTracker.trackError(error, ErrorCategory.API_ERROR, ErrorSeverity.HIGH, {
    additionalData: {
      endpoint,
      statusCode: (error as IApplicationError).statusCode,
      errorCode: (error as IApplicationError).code,
    },
  });
};
