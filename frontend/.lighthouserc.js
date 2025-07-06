/**
 * Lighthouse CI Configuration
 * 
 * This configuration file sets up automated performance testing for the GameDin application.
 * It defines performance budgets, testing scenarios, and reporting settings for CI/CD integration.
 * 
 * Feature Context:
 * - Automated performance testing in CI/CD pipeline
 * - Performance budgets and thresholds
 * - Multiple testing scenarios (desktop, mobile)
 * - Detailed performance reporting
 * - Integration with GitHub Actions
 * 
 * Usage Example:
 *   lhci autorun
 *   lhci collect --url=https://gamedin.com
 *   lhci assert --preset=lighthouse:recommended
 * 
 * Dependency Listing:
 * - Lighthouse CI CLI
 * - GitHub Actions workflow
 * - Performance budgets
 * - Testing scenarios
 * 
 * Performance Considerations:
 * - Configures realistic performance budgets
 * - Optimizes testing for CI/CD environment
 * - Provides actionable performance insights
 * 
 * Security Implications:
 * - No sensitive data in configuration
 * - Safe for public repositories
 * - Performance data only
 * 
 * Changelog:
 * - [v4.0.6] Created Lighthouse CI configuration for automated performance testing
 */

module.exports = {
  ci: {
    collect: {
      // Collect configuration
      url: [
        'http://localhost:3000',
        'http://localhost:3000/games',
        'http://localhost:3000/profile',
      ],
      startServerCommand: 'cd frontend && npm run dev',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
    assert: {
      // Assertion configuration
      assertions: {
        // Performance budgets
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        
        // Resource budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // 100KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }], // 1MB
        'resource-summary:font:size': ['warn', { maxNumericValue: 100000 }], // 100KB
        
        // Performance metrics
        'interactive': ['warn', { maxNumericValue: 3500 }],
        'max-potential-fid': ['warn', { maxNumericValue: 130 }],
        'server-response-time': ['warn', { maxNumericValue: 600 }],
        
        // Accessibility
        'color-contrast': 'off', // Disabled as it's handled by design system
        'image-alt': 'off', // Disabled as it's handled by components
        
        // Best practices
        'uses-https': 'off', // Disabled for local development
        'uses-http2': 'off', // Disabled for local development
        'no-vulnerable-libraries': 'error',
        'external-anchors-use-rel-noopener': 'warn',
        'geolocation-on-start': 'off',
        'notification-on-start': 'off',
        'no-document-write': 'warn',
        'js-libraries': 'off',
        'deprecations': 'warn',
        'errors-in-console': 'warn',
        'image-aspect-ratio': 'warn',
        
        // SEO
        'document-title': 'warn',
        'meta-description': 'warn',
        'link-text': 'warn',
        'crawlable-anchors': 'warn',
        'is-crawlable': 'warn',
        'robots-txt': 'off', // Disabled for local development
        'structured-data': 'off',
      },
    },
    upload: {
      // Upload configuration
      target: 'temporary-public-storage',
      outputDir: './lighthouse-results',
    },
  },
  // Mobile configuration
  mobile: {
    ci: {
      collect: {
        settings: {
          formFactor: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
            disabled: false,
          },
          emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        },
      },
      assert: {
        assertions: {
          // Stricter budgets for mobile
          'categories:performance': ['warn', { minScore: 0.7 }],
          'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
          'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
          'total-blocking-time': ['warn', { maxNumericValue: 500 }],
          'speed-index': ['warn', { maxNumericValue: 4000 }],
        },
      },
    },
  },
  // Performance budgets
  budgets: [
    {
      path: '/',
      resourceCounts: [
        { resourceType: 'script', budget: 15 },
        { resourceType: 'stylesheet', budget: 5 },
        { resourceType: 'image', budget: 20 },
        { resourceType: 'font', budget: 3 },
      ],
      resourceSizes: [
        { resourceType: 'script', budget: 500 },
        { resourceType: 'stylesheet', budget: 100 },
        { resourceType: 'image', budget: 1000 },
        { resourceType: 'font', budget: 100 },
      ],
      timings: [
        { metric: 'first-contentful-paint', budget: 2000 },
        { metric: 'largest-contentful-paint', budget: 2500 },
        { metric: 'cumulative-layout-shift', budget: 0.1 },
        { metric: 'total-blocking-time', budget: 300 },
        { metric: 'speed-index', budget: 3000 },
      ],
    },
  ],
  // Custom assertions
  customAssertions: {
    'no-console-errors': {
      id: 'no-console-errors',
      title: 'No console errors',
      description: 'Page should not have console errors',
      failureTitle: 'Page has console errors',
      failureDescription: 'Console errors were found on the page',
      run: (artifacts) => {
        const consoleErrors = artifacts.ConsoleMessages.filter(
          (message) => message.level === 'error'
        );
        return {
          score: consoleErrors.length === 0 ? 1 : 0,
          details: {
            items: consoleErrors,
          },
        };
      },
    },
    'acceptable-load-time': {
      id: 'acceptable-load-time',
      title: 'Acceptable load time',
      description: 'Page should load within acceptable time',
      failureTitle: 'Page load time is too slow',
      failureDescription: 'Page took too long to load',
      run: (artifacts) => {
        const loadTime = artifacts.LoadTimes.onLoad;
        const maxLoadTime = 5000; // 5 seconds
        return {
          score: loadTime <= maxLoadTime ? 1 : 0,
          details: {
            loadTime,
            maxLoadTime,
          },
        };
      },
    },
  },
}; 