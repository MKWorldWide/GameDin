/**
 * AWS Performance Optimization Service for GameDin
 *
 * This service provides comprehensive performance optimization capabilities
 * including CloudFront integration, static asset optimization, and performance
 * monitoring for optimal AWS deployment.
 *
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

import { getEnvironmentConfig, isFeatureEnabled } from '../config/aws-environment';

// Performance optimization types
export interface PerformanceConfig {
  cloudFrontEnabled: boolean;
  compressionEnabled: boolean;
  cachingEnabled: boolean;
  imageOptimization: boolean;
  fontOptimization: boolean;
  bundleOptimization: boolean;
}

// Asset optimization types
export interface AssetOptimization {
  type: 'image' | 'font' | 'script' | 'style';
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  url: string;
  cdnUrl?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  speedIndex: number;
}

/**
 * AWS Performance Optimization Service Class
 */
export class AWSPerformanceService {
  private config = getEnvironmentConfig();
  private cloudFrontDomain: string;
  private isEnabled: boolean;

  constructor() {
    this.cloudFrontDomain = this.config.awsServices.cloudFront.domain;
    this.isEnabled = isFeatureEnabled('cloudFrontOptimization');
  }

  /**
   * Get performance configuration
   */
  public getPerformanceConfig(): PerformanceConfig {
    return {
      cloudFrontEnabled: this.isEnabled && !!this.cloudFrontDomain,
      compressionEnabled: this.config.awsServices.costOptimization.compression !== 'minimal',
      cachingEnabled: this.config.awsServices.costOptimization.caching !== 'minimal',
      imageOptimization: isFeatureEnabled('advancedCaching'),
      fontOptimization: isFeatureEnabled('advancedCaching'),
      bundleOptimization: this.config.awsServices.costOptimization.compression === 'aggressive',
    };
  }

  /**
   * Optimize asset URL for CloudFront
   */
  public optimizeAssetUrl(url: string): string {
    if (!this.isEnabled || !this.cloudFrontDomain) {
      return url;
    }

    // Convert relative URLs to absolute CloudFront URLs
    if (url.startsWith('/')) {
      return `https://${this.cloudFrontDomain}${url}`;
    }

    // Convert local URLs to CloudFront URLs
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      const path = new URL(url).pathname;
      return `https://${this.cloudFrontDomain}${path}`;
    }

    return url;
  }

  /**
   * Optimize image URL with CloudFront parameters
   */
  public optimizeImageUrl(url: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  }): string {
    const optimizedUrl = this.optimizeAssetUrl(url);

    if (!options || !this.isEnabled) {
      return optimizedUrl;
    }

    const params = new URLSearchParams();

    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);

    return `${optimizedUrl}?${params.toString()}`;
  }

  /**
   * Preload critical assets
   */
  public preloadAssets(assets: string[]): void {
    if (!this.isEnabled) return;

    assets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = this.optimizeAssetUrl(asset);

      if (asset.endsWith('.css')) {
        link.as = 'style';
      } else if (asset.endsWith('.js')) {
        link.as = 'script';
      } else if (asset.match(/\.(woff2?|ttf|eot)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (asset.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      }

      document.head.appendChild(link);
    });
  }

  /**
   * Optimize font loading
   */
  public optimizeFontLoading(fonts: Array<{
    family: string;
    weight: string;
    style: string;
    url: string;
  }>): void {
    if (!this.isEnabled) return;

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = this.optimizeAssetUrl(font.url);
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';

      document.head.appendChild(link);
    });
  }

  /**
   * Measure performance metrics
   */
  public async measurePerformance(): Promise<PerformanceMetrics> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: PerformanceMetrics = {
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            firstInputDelay: 0,
            cumulativeLayoutShift: 0,
            totalBlockingTime: 0,
            speedIndex: 0,
          };

          entries.forEach(entry => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime;
            } else if (entry.entryType === 'largest-contentful-paint') {
              metrics.largestContentfulPaint = entry.startTime;
            } else if (entry.entryType === 'first-input') {
              metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
            } else if (entry.entryType === 'layout-shift') {
              metrics.cumulativeLayoutShift += (entry as any).value;
            }
          });

          resolve(metrics);
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } else {
        // Fallback for older browsers
        setTimeout(() => {
          resolve({
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            firstInputDelay: 0,
            cumulativeLayoutShift: 0,
            totalBlockingTime: 0,
            speedIndex: 0,
          });
        }, 1000);
      }
    });
  }

  /**
   * Optimize bundle loading
   */
  public optimizeBundleLoading(): void {
    if (!this.isEnabled) return;

    // Add resource hints for better performance
    const resourceHints = [
      { rel: 'dns-prefetch', href: this.cloudFrontDomain },
      { rel: 'preconnect', href: `https://${this.cloudFrontDomain}` },
    ];

    resourceHints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }

  /**
   * Optimize critical CSS
   */
  public optimizeCriticalCSS(criticalCSS: string): void {
    if (!this.isEnabled) return;

    // Inline critical CSS
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
  }

  /**
   * Optimize non-critical CSS loading
   */
  public loadNonCriticalCSS(url: string): void {
    if (!this.isEnabled) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = this.optimizeAssetUrl(url);
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  }

  /**
   * Optimize JavaScript loading
   */
  public optimizeJavaScriptLoading(scripts: string[]): void {
    if (!this.isEnabled) return;

    scripts.forEach(script => {
      const scriptElement = document.createElement('script');
      scriptElement.src = this.optimizeAssetUrl(script);
      scriptElement.async = true;
      scriptElement.defer = true;
      document.head.appendChild(scriptElement);
    });
  }

  /**
   * Get asset optimization status
   */
  public getAssetOptimizationStatus(): {
    cloudFrontEnabled: boolean;
    compressionEnabled: boolean;
    cachingEnabled: boolean;
    domain: string;
    } {
    return {
      cloudFrontEnabled: this.isEnabled,
      compressionEnabled: this.config.awsServices.costOptimization.compression !== 'minimal',
      cachingEnabled: this.config.awsServices.costOptimization.caching !== 'minimal',
      domain: this.cloudFrontDomain,
    };
  }

  /**
   * Optimize API calls with caching
   */
  public optimizeApiCall(url: string, options?: {
    cache?: boolean;
    cacheTime?: number;
    compression?: boolean;
  }): string {
    if (!this.isEnabled) return url;

    const optimizedUrl = this.optimizeAssetUrl(url);

    if (!options) return optimizedUrl;

    const params = new URLSearchParams();

    if (options.cache) {
      params.append('cache', 'true');
      if (options.cacheTime) {
        params.append('cacheTime', options.cacheTime.toString());
      }
    }

    if (options.compression) {
      params.append('compress', 'true');
    }

    return `${optimizedUrl}?${params.toString()}`;
  }

  /**
   * Get performance recommendations
   */
  public getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const config = this.getPerformanceConfig();

    if (!config.cloudFrontEnabled) {
      recommendations.push('Enable CloudFront CDN for better global performance');
    }

    if (!config.compressionEnabled) {
      recommendations.push('Enable compression to reduce asset sizes');
    }

    if (!config.cachingEnabled) {
      recommendations.push('Enable caching to improve load times');
    }

    if (!config.imageOptimization) {
      recommendations.push('Enable image optimization for better performance');
    }

    if (!config.fontOptimization) {
      recommendations.push('Enable font optimization for faster text rendering');
    }

    return recommendations;
  }

  /**
   * Initialize performance optimizations
   */
  public initialize(): void {
    if (!this.isEnabled) return;

    // Optimize bundle loading
    this.optimizeBundleLoading();

    // Preload critical assets
    this.preloadAssets([
      '/assets/fonts/main.woff2',
      '/assets/css/critical.css',
      '/assets/js/main.js',
    ]);

    // Optimize font loading
    this.optimizeFontLoading([
      {
        family: 'Inter',
        weight: '400',
        style: 'normal',
        url: '/assets/fonts/inter-regular.woff2',
      },
      {
        family: 'Inter',
        weight: '600',
        style: 'normal',
        url: '/assets/fonts/inter-semibold.woff2',
      },
    ]);

    // Load non-critical CSS
    this.loadNonCriticalCSS('/assets/css/non-critical.css');
  }
}

// Create singleton instance
export const awsPerformance = new AWSPerformanceService();

// Export utility functions
export const performance = {
  getConfig: () => awsPerformance.getPerformanceConfig(),
  optimizeUrl: (url: string) => awsPerformance.optimizeAssetUrl(url),
  optimizeImage: (url: string, options?: any) => awsPerformance.optimizeImageUrl(url, options),
  preloadAssets: (assets: string[]) => awsPerformance.preloadAssets(assets),
  optimizeFonts: (fonts: any[]) => awsPerformance.optimizeFontLoading(fonts),
  measurePerformance: () => awsPerformance.measurePerformance(),
  optimizeBundle: () => awsPerformance.optimizeBundleLoading(),
  optimizeCSS: (css: string) => awsPerformance.optimizeCriticalCSS(css),
  loadNonCriticalCSS: (url: string) => awsPerformance.loadNonCriticalCSS(url),
  optimizeJS: (scripts: string[]) => awsPerformance.optimizeJavaScriptLoading(scripts),
  getStatus: () => awsPerformance.getAssetOptimizationStatus(),
  optimizeApi: (url: string, options?: any) => awsPerformance.optimizeApiCall(url, options),
  getRecommendations: () => awsPerformance.getPerformanceRecommendations(),
  initialize: () => awsPerformance.initialize(),
};

export default awsPerformance;
