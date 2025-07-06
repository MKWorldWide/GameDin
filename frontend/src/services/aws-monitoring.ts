/**
 * AWS Monitoring Service for GameDin
 *
 * This service provides comprehensive monitoring capabilities using AWS CloudWatch
 * and X-Ray for performance tracking, error monitoring, and custom metrics.
 *
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

import { CloudWatchClient, PutMetricDataCommand, StandardUnit } from '@aws-sdk/client-cloudwatch';
import { XRayClient, PutTraceSegmentsCommand } from '@aws-sdk/client-xray';

import { awsEnv, getEnvironmentConfig } from '../config/aws-environment';

// Monitoring event types
export interface MonitoringEvent {
  timestamp: number;
  eventType: 'performance' | 'error' | 'user_action' | 'api_call' | 'custom';
  name: string;
  value?: number;
  unit?: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
}

// Error tracking
export interface ErrorEvent {
  error: Error;
  context: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

// Custom metrics
export interface CustomMetric {
  namespace: string;
  metricName: string;
  value: number;
  unit: StandardUnit;
  dimensions?: Record<string, string>;
  timestamp?: number;
}

/**
 * AWS Monitoring Service Class
 */
export class AWSMonitoringService {
  private cloudWatchClient: CloudWatchClient | null = null;
  private xRayClient: XRayClient | null = null;
  private config = getEnvironmentConfig();
  private isEnabled: boolean;
  private sampleRate: number;
  private metricsBuffer: CustomMetric[] = [];
  private bufferSize = 20;
  private flushInterval = 60000; // 1 minute
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.isEnabled = this.config.monitoring.enabled;
    this.sampleRate = this.config.monitoring.sampleRate;

    if (this.isEnabled && this.config.awsServices.monitoring.cloudWatch) {
      this.initializeCloudWatch();
    }

    if (this.isEnabled && this.config.awsServices.monitoring.xRay) {
      this.initializeXRay();
    }

    this.startFlushTimer();
  }

  /**
   * Initialize CloudWatch client
   */
  private initializeCloudWatch(): void {
    try {
      this.cloudWatchClient = new CloudWatchClient({
        region: this.config.awsServices.region,
        credentials: {
          accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || '',
        },
      });
    } catch (error) {
      console.error('Failed to initialize CloudWatch client:', error);
    }
  }

  /**
   * Initialize X-Ray client
   */
  private initializeXRay(): void {
    try {
      this.xRayClient = new XRayClient({
        region: this.config.awsServices.region,
        credentials: {
          accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || '',
        },
      });
    } catch (error) {
      console.error('Failed to initialize X-Ray client:', error);
    }
  }

  /**
   * Start flush timer for metrics
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  /**
   * Check if monitoring is enabled and should sample
   */
  private shouldSample(): boolean {
    if (!this.isEnabled) return false;
    return Math.random() < this.sampleRate;
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metrics: PerformanceMetrics): void {
    if (!this.shouldSample()) return;

    const timestamp = Date.now();
    const namespace = 'GameDin/Performance';

    // Page load time
    this.addMetric({
      namespace,
      metricName: 'PageLoadTime',
      value: metrics.pageLoadTime,
      unit: StandardUnit.Milliseconds,
      timestamp,
    });

    // API response time
    this.addMetric({
      namespace,
      metricName: 'ApiResponseTime',
      value: metrics.apiResponseTime,
      unit: StandardUnit.Milliseconds,
      timestamp,
    });

    // Render time
    this.addMetric({
      namespace,
      metricName: 'RenderTime',
      value: metrics.renderTime,
      unit: StandardUnit.Milliseconds,
      timestamp,
    });

    // Memory usage
    this.addMetric({
      namespace,
      metricName: 'MemoryUsage',
      value: metrics.memoryUsage,
      unit: StandardUnit.Bytes,
      timestamp,
    });

    // CPU usage
    this.addMetric({
      namespace,
      metricName: 'CpuUsage',
      value: metrics.cpuUsage,
      unit: StandardUnit.Percent,
      timestamp,
    });

    // Network latency
    this.addMetric({
      namespace,
      metricName: 'NetworkLatency',
      value: metrics.networkLatency,
      unit: StandardUnit.Milliseconds,
      timestamp,
    });
  }

  /**
   * Track error events
   */
  public trackError(errorEvent: ErrorEvent): void {
    if (!this.shouldSample()) return;

    const timestamp = Date.now();
    const namespace = 'GameDin/Errors';

    // Error count
    this.addMetric({
      namespace,
      metricName: 'ErrorCount',
      value: 1,
      unit: 'Count',
      timestamp,
      dimensions: {
        ErrorType: errorEvent.error.name,
        Context: errorEvent.context,
      },
    });

    // Log error details if debug mode is enabled
    if (this.config.featureFlags.debugMode) {
      console.error('Error tracked:', {
        error: errorEvent.error.message,
        context: errorEvent.context,
        stack: errorEvent.stack,
        metadata: errorEvent.metadata,
      });
    }
  }

  /**
   * Track user actions
   */
  public trackUserAction(action: string, metadata?: Record<string, any>): void {
    if (!this.shouldSample()) return;

    const timestamp = Date.now();
    const namespace = 'GameDin/UserActions';

    this.addMetric({
      namespace,
      metricName: 'UserAction',
      value: 1,
      unit: 'Count',
      timestamp,
      dimensions: {
        Action: action,
      },
    });

    // Track custom metadata if provided
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        this.addMetric({
          namespace,
          metricName: `UserAction_${key}`,
          value: typeof value === 'number' ? value : 1,
          unit: typeof value === 'number' ? 'None' : 'Count',
          timestamp,
          dimensions: {
            Action: action,
            MetadataKey: key,
          },
        });
      });
    }
  }

  /**
   * Track API calls
   */
  public trackApiCall(endpoint: string, method: string, responseTime: number, statusCode: number): void {
    if (!this.shouldSample()) return;

    const timestamp = Date.now();
    const namespace = 'GameDin/API';

    // API call count
    this.addMetric({
      namespace,
      metricName: 'ApiCallCount',
      value: 1,
      unit: 'Count',
      timestamp,
      dimensions: {
        Endpoint: endpoint,
        Method: method,
        StatusCode: statusCode.toString(),
      },
    });

    // API response time
    this.addMetric({
      namespace,
      metricName: 'ApiResponseTime',
      value: responseTime,
      unit: 'Milliseconds',
      timestamp,
      dimensions: {
        Endpoint: endpoint,
        Method: method,
      },
    });

    // API error rate
    if (statusCode >= 400) {
      this.addMetric({
        namespace,
        metricName: 'ApiErrorRate',
        value: 1,
        unit: 'Count',
        timestamp,
        dimensions: {
          Endpoint: endpoint,
          Method: method,
          StatusCode: statusCode.toString(),
        },
      });
    }
  }

  /**
   * Add custom metric
   */
  public addMetric(metric: CustomMetric): void {
    if (!this.isEnabled) return;

    this.metricsBuffer.push({
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    });

    // Flush if buffer is full
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Flush metrics to CloudWatch
   */
  private async flushMetrics(): Promise<void> {
    if (!this.cloudWatchClient || this.metricsBuffer.length === 0) return;

    try {
      const metricData = this.metricsBuffer.map(metric => ({
        MetricName: metric.metricName,
        Value: metric.value,
        Unit: metric.unit,
        Timestamp: new Date(metric.timestamp),
        Dimensions: metric.dimensions
          ? Object.entries(metric.dimensions).map(([name, value]) => ({
            Name: name,
            Value: value,
          })) : undefined,
      }));

      // Group metrics by namespace
      const metricsByNamespace = this.metricsBuffer.reduce((acc, metric) => {
        if (!acc[metric.namespace]) {
          acc[metric.namespace] = [];
        }
        acc[metric.namespace].push(metric);
        return acc;
      }, {} as Record<string, CustomMetric[]>);

      // Send metrics for each namespace
      for (const [namespace, metrics] of Object.entries(metricsByNamespace)) {
        const command = new PutMetricDataCommand({
          Namespace: namespace,
          MetricData: metrics.map(metric => ({
            MetricName: metric.metricName,
            Value: metric.value,
            Unit: metric.unit,
            Timestamp: new Date(metric.timestamp),
            Dimensions: metric.dimensions
              ? Object.entries(metric.dimensions).map(([name, value]) => ({
                Name: name,
                Value: value,
              })) : undefined,
          })),
        });

        await this.cloudWatchClient!.send(command);
      }

      // Clear buffer after successful flush
      this.metricsBuffer = [];

    } catch (error) {
      console.error('Failed to flush metrics to CloudWatch:', error);

      // Keep metrics in buffer for retry if it's a temporary error
      if (this.metricsBuffer.length > this.bufferSize * 2) {
        console.warn('Metrics buffer overflow, dropping oldest metrics');
        this.metricsBuffer = this.metricsBuffer.slice(-this.bufferSize);
      }
    }
  }

  /**
   * Track page load performance
   */
  public trackPageLoad(): void {
    if (!this.shouldSample()) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      apiResponseTime: 0, // Will be updated by API calls
      renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      cpuUsage: 0, // Browser doesn't provide CPU usage
      networkLatency: navigation.responseStart - navigation.requestStart,
    };

    this.trackPerformance(metrics);
  }

  /**
   * Track component render performance
   */
  public trackComponentRender(componentName: string, renderTime: number): void {
    if (!this.shouldSample()) return;

    const timestamp = Date.now();
    const namespace = 'GameDin/Components';

    this.addMetric({
      namespace,
      metricName: 'ComponentRenderTime',
      value: renderTime,
      unit: 'Milliseconds',
      timestamp,
      dimensions: {
        Component: componentName,
      },
    });
  }

  /**
   * Track resource loading performance
   */
  public trackResourceLoad(): void {
    if (!this.shouldSample()) return;

    const resources = performance.getEntriesByType('resource');
    const timestamp = Date.now();
    const namespace = 'GameDin/Resources';

    resources.forEach(resource => {
      this.addMetric({
        namespace,
        metricName: 'ResourceLoadTime',
        value: resource.duration,
        unit: 'Milliseconds',
        timestamp,
        dimensions: {
          ResourceType: resource.initiatorType,
          ResourceName: resource.name,
        },
      });
    });
  }

  /**
   * Get monitoring status
   */
  public getStatus(): {
    enabled: boolean;
    cloudWatch: boolean;
    xRay: boolean;
    bufferSize: number;
    sampleRate: number;
    } {
    return {
      enabled: this.isEnabled,
      cloudWatch: !!this.cloudWatchClient,
      xRay: !!this.xRayClient,
      bufferSize: this.metricsBuffer.length,
      sampleRate: this.sampleRate,
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining metrics
    this.flushMetrics();
  }
}

// Create singleton instance
export const awsMonitoring = new AWSMonitoringService();

// Export utility functions
export const monitoring = {
  trackPerformance: (metrics: PerformanceMetrics) => awsMonitoring.trackPerformance(metrics),
  trackError: (errorEvent: ErrorEvent) => awsMonitoring.trackError(errorEvent),
  trackUserAction: (action: string, metadata?: Record<string, any>) =>
    awsMonitoring.trackUserAction(action, metadata),
  trackApiCall: (endpoint: string, method: string, responseTime: number, statusCode: number) =>
    awsMonitoring.trackApiCall(endpoint, method, responseTime, statusCode),
  trackPageLoad: () => awsMonitoring.trackPageLoad(),
  trackComponentRender: (componentName: string, renderTime: number) =>
    awsMonitoring.trackComponentRender(componentName, renderTime),
  trackResourceLoad: () => awsMonitoring.trackResourceLoad(),
  getStatus: () => awsMonitoring.getStatus(),
  destroy: () => awsMonitoring.destroy(),
};

export default awsMonitoring;
