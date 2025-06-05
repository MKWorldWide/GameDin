// Metric types
interface TypeMetric {
  timestamp: number;
  type: string;
  success: boolean;
  duration: number;
  context: string;
}

interface ValidationMetric {
  timestamp: number;
  validationType: string;
  success: boolean;
  errors?: string[];
  context: string;
}

interface TypeGuardMetric {
  timestamp: number;
  guardName: string;
  success: boolean;
  value: unknown;
  context: string;
}

class MetricsTracker {
  private static instance: MetricsTracker;
  private typeMetrics: TypeMetric[] = [];
  private validationMetrics: ValidationMetric[] = [];
  private typeGuardMetrics: TypeGuardMetric[] = [];
  private readonly MAX_METRICS = 1000;

  private constructor() {}

  public static getInstance(): MetricsTracker {
    if (!MetricsTracker.instance) {
      MetricsTracker.instance = new MetricsTracker();
    }
    return MetricsTracker.instance;
  }

  // Type checking metrics
  public trackTypeCheck(type: string, success: boolean, duration: number, context: string): void {
    const metric: TypeMetric = {
      timestamp: Date.now(),
      type,
      success,
      duration,
      context,
    };

    this.typeMetrics.push(metric);
    if (this.typeMetrics.length > this.MAX_METRICS) {
      this.typeMetrics.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Type check metric:', metric);
    }
  }

  // Validation metrics
  public trackValidation(
    validationType: string,
    success: boolean,
    context: string,
    errors?: string[]
  ): void {
    const metric: ValidationMetric = {
      timestamp: Date.now(),
      validationType,
      success,
      errors,
      context,
    };

    this.validationMetrics.push(metric);
    if (this.validationMetrics.length > this.MAX_METRICS) {
      this.validationMetrics.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Validation metric:', metric);
    }
  }

  // Type guard usage metrics
  public trackTypeGuard(
    guardName: string,
    success: boolean,
    value: unknown,
    context: string
  ): void {
    const metric: TypeGuardMetric = {
      timestamp: Date.now(),
      guardName,
      success,
      value,
      context,
    };

    this.typeGuardMetrics.push(metric);
    if (this.typeGuardMetrics.length > this.MAX_METRICS) {
      this.typeGuardMetrics.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Type guard metric:', metric);
    }
  }

  // Analytics methods
  public getTypeCheckStats(): Record<string, { total: number; success: number }> {
    const stats: Record<string, { total: number; success: number }> = {};

    this.typeMetrics.forEach(metric => {
      if (!stats[metric.type]) {
        stats[metric.type] = { total: 0, success: 0 };
      }
      stats[metric.type].total++;
      if (metric.success) {
        stats[metric.type].success++;
      }
    });

    return stats;
  }

  public getValidationStats(): Record<string, { total: number; success: number }> {
    const stats: Record<string, { total: number; success: number }> = {};

    this.validationMetrics.forEach(metric => {
      if (!stats[metric.validationType]) {
        stats[metric.validationType] = { total: 0, success: 0 };
      }
      stats[metric.validationType].total++;
      if (metric.success) {
        stats[metric.validationType].success++;
      }
    });

    return stats;
  }

  public getTypeGuardStats(): Record<string, { total: number; success: number }> {
    const stats: Record<string, { total: number; success: number }> = {};

    this.typeGuardMetrics.forEach(metric => {
      if (!stats[metric.guardName]) {
        stats[metric.guardName] = { total: 0, success: 0 };
      }
      stats[metric.guardName].total++;
      if (metric.success) {
        stats[metric.guardName].success++;
      }
    });

    return stats;
  }

  public getAverageTypeCheckDuration(): Record<string, number> {
    const durations: Record<string, number[]> = {};

    this.typeMetrics.forEach(metric => {
      if (!durations[metric.type]) {
        durations[metric.type] = [];
      }
      durations[metric.type].push(metric.duration);
    });

    const averages: Record<string, number> = {};
    Object.entries(durations).forEach(([type, durationList]) => {
      averages[type] = durationList.reduce((a, b) => a + b, 0) / durationList.length;
    });

    return averages;
  }

  public clearMetrics(): void {
    this.typeMetrics = [];
    this.validationMetrics = [];
    this.typeGuardMetrics = [];
  }
}

// Export singleton instance
export const metricsTracker = MetricsTracker.getInstance();

// Utility functions for common metrics tracking scenarios
export const trackValidationFailure = (type: string, errors: string[], context: string): void => {
  metricsTracker.trackValidation(type, false, context, errors);
};

export const trackTypeGuardUsage = (
  guardName: string,
  success: boolean,
  value: unknown,
  context: string
): void => {
  metricsTracker.trackTypeGuard(guardName, success, value, context);
};

export const measureTypeCheck = async <T>(
  type: string,
  context: string,
  checkFn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await checkFn();
    const duration = performance.now() - start;
    metricsTracker.trackTypeCheck(type, true, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    metricsTracker.trackTypeCheck(type, false, duration, context);
    throw error;
  }
};
