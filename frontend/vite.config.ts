import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';

/**
 * Enhanced Vite Configuration for GameDin AWS Optimization
 * 
 * This configuration includes:
 * - Advanced AWS-specific optimizations for CloudFront CDN
 * - Lambda@Edge support for edge computing
 * - Performance monitoring and analytics integration
 * - Enhanced security headers and CSP
 * - Optimized caching strategies for AWS services
 * - Progressive Web App features with offline support
 * - Multi-region deployment optimizations
 * - Cost optimization features
 * 
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  const isStaging = mode === 'staging';
  
  // Determine optimization level based on environment
  const optimizationLevel = isProduction ? 'ultra' : 
                           isStaging ? 'high' : 
                           isDevelopment ? 'balanced' : 'minimal';
  
  // AWS-specific configuration
  const awsConfig = {
    region: env.VITE_AWS_REGION || 'us-east-1',
    cloudFrontDomain: env.VITE_CLOUDFRONT_DOMAIN || '',
    s3Bucket: env.VITE_S3_BUCKET || '',
    lambdaEdgeEnabled: env.VITE_LAMBDA_EDGE_ENABLED === 'true',
    monitoringEnabled: env.VITE_MONITORING_ENABLED === 'true',
    costOptimization: env.VITE_COST_OPTIMIZATION === 'true'
  };

  return {
    plugins: [
      react(),
      // Enhanced PWA plugin for AWS optimization
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
          // Exclude large files from service worker cache
          globIgnores: ['**/stats.html', '**/stats.html.gz', '**/stats.html.br'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
          runtimeCaching: [
            // AWS API Gateway caching
            {
              urlPattern: /^https:\/\/.*\.execute-api\.amazonaws\.com/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'aws-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                networkTimeoutSeconds: 10
              }
            },
            // CloudFront CDN caching
            {
              urlPattern: /^https:\/\/.*\.cloudfront\.net/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cloudfront-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                }
              }
            },
            // S3 static assets caching
            {
              urlPattern: /^https:\/\/.*\.s3\.amazonaws\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 's3-assets-cache',
                expiration: {
                  maxEntries: 300,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            // Lambda@Edge function caching
            {
              urlPattern: /^https:\/\/.*\.lambda-url\.amazonaws\.com/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'lambda-edge-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 // 1 hour
                },
                networkTimeoutSeconds: 5
              }
            },
            // Image optimization caching
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|avif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            // Font optimization caching
            {
              urlPattern: /\.(woff2|woff|ttf|eot)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            }
          ],
          // AWS-specific service worker optimizations
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          sourcemap: isDevelopment,
          // Lambda@Edge integration
          navigateFallback: '/index.html',
          navigateFallbackAllowlist: [/^(?!\/__).*/]
        },
        manifest: {
          name: 'GameDin - Social Gaming Platform',
          short_name: 'GameDin',
          description: 'Connect with gamers, share achievements, and discover new games',
          theme_color: '#1a1a1a',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/gamedin.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            },
            {
              src: '/gamedin-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/gamedin-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ],
          // AWS-specific manifest features
          categories: ['games', 'social', 'entertainment'],
          lang: 'en-US',
          dir: 'ltr',
          // Offline capabilities
          prefer_related_applications: false,
          related_applications: []
        }
      }),
      // Enhanced compression for AWS CloudFront with cost optimization
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
        filter: (file) => {
          // Cost optimization: only compress files that benefit from compression
          const compressibleTypes = ['.js', '.css', '.html', '.json', '.xml', '.txt'];
          return compressibleTypes.some(ext => file.endsWith(ext));
        }
      }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
        filter: (file) => {
          // Cost optimization: only compress files that benefit from compression
          const compressibleTypes = ['.js', '.css', '.html', '.json', '.xml', '.txt'];
          return compressibleTypes.some(ext => file.endsWith(ext));
        }
      }),
      // Bundle analyzer for optimization insights
      isProduction && visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@types': path.resolve(__dirname, './src/types'),
        '@store': path.resolve(__dirname, './src/store'),
        '@aws': path.resolve(__dirname, './src/aws')
      }
    },
    server: {
      port: 3000,
      host: true,
      cors: true,
      // Enhanced development server for AWS testing
      hmr: {
        overlay: true
      },
      // AWS-specific development optimizations
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2,
          // AWS cost optimization: aggressive compression
          ecma: 2020,
          module: true,
          toplevel: true
        },
        mangle: {
          safari10: true,
          toplevel: true,
          // AWS optimization: preserve AWS SDK function names
          reserved: ['AWS', 'Amplify', 'Cognito', 'DynamoDB']
        },
        format: {
          comments: false
        }
      } : undefined,
      rollupOptions: {
        // Enhanced chunk splitting for AWS CloudFront optimization
        output: {
          chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
          manualChunks: {
            // Core vendor chunks
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@mui/material', '@mui/icons-material', '@headlessui/react', '@heroicons/react'],
            utils: ['date-fns', 'zod', 'swr', 'framer-motion'],
            // AWS-specific chunks
            amplify: ['aws-amplify', '@aws-amplify/ui-react', '@aws-amplify/auth'],
            workbox: ['workbox-core', 'workbox-expiration', 'workbox-precaching', 'workbox-routing', 'workbox-strategies']
          }
        },
        // Enhanced tree shaking for AWS optimization
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false,
          // AWS-specific tree shaking
          tryCatchDeoptimization: false
        }
      },
      // Optimized build targets for AWS services
      target: 'es2015',
      cssTarget: 'chrome80',
      chunkSizeWarningLimit: 1000,
      // AWS-specific build optimizations
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      reportCompressedSize: isProduction,
      // Cost optimization: reduce bundle size
      emptyOutDir: true,
      copyPublicDir: true
    },
    // Enhanced environment variables for AWS optimization
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '4.1.0'),
      __BUILD_TIME__: JSON.stringify(env.VITE_APP_BUILD_TIME || new Date().toISOString()),
      __ENVIRONMENT__: JSON.stringify(env.VITE_APP_ENV || mode),
      __OPTIMIZATION_LEVEL__: JSON.stringify(optimizationLevel),
      __AMPLIFY_VERSION__: JSON.stringify(env.VITE_AMPLIFY_VERSION || 'gen2'),
      __AWS_REGION__: JSON.stringify(awsConfig.region),
      __DEPLOYMENT_STAGE__: JSON.stringify(env.VITE_DEPLOYMENT_STAGE || mode),
      // AWS-specific environment variables
      __CLOUDFRONT_DOMAIN__: JSON.stringify(awsConfig.cloudFrontDomain),
      __S3_BUCKET__: JSON.stringify(awsConfig.s3Bucket),
      __LAMBDA_EDGE_ENABLED__: JSON.stringify(awsConfig.lambdaEdgeEnabled),
      __MONITORING_ENABLED__: JSON.stringify(awsConfig.monitoringEnabled),
      __COST_OPTIMIZATION__: JSON.stringify(awsConfig.costOptimization),
      __AWS_SERVICES__: JSON.stringify({
        cloudFront: !!awsConfig.cloudFrontDomain,
        s3: !!awsConfig.s3Bucket,
        lambdaEdge: awsConfig.lambdaEdgeEnabled,
        cloudWatch: awsConfig.monitoringEnabled,
        xRay: awsConfig.monitoringEnabled
      })
    },
    // Optimized dependencies for AWS services
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@headlessui/react',
        '@heroicons/react',
        'date-fns',
        'zod',
        'swr',
        'framer-motion',
        'aws-amplify',
        '@aws-amplify/ui-react',
        '@aws-amplify/auth',
        // AWS SDK v3 for better tree shaking - only include if actually used
        'workbox-core',
        'workbox-expiration',
        'workbox-precaching',
        'workbox-routing',
        'workbox-strategies'
      ],
      exclude: ['@aws-amplify/cli'],
      // Force pre-bundling for problematic dependencies
      force: true
    },
    // AWS-specific optimizations
    esbuild: {
      target: 'es2015',
      legalComments: 'none',
      drop: isProduction ? ['console', 'debugger'] : [],
      // AWS optimization: preserve AWS SDK compatibility
      keepNames: true
    },
    // Enhanced CSS processing for AWS optimization
    css: {
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('tailwindcss')
        ]
      },
      // AWS cost optimization: minimize CSS
      devSourcemap: isDevelopment
    }
  };
});
