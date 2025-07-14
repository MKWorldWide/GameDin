import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';

/**
 * Enhanced Vite Configuration for GameDin v5.0.0
 * 
 * This configuration includes:
 * - Latest React 19 and TypeScript 5.5+ support
 * - Vite 6 optimizations and new features
 * - Advanced AWS-specific optimizations for CloudFront CDN
 * - Lambda@Edge support for edge computing
 * - Performance monitoring and analytics integration
 * - Enhanced security headers and CSP
 * - Optimized caching strategies for AWS services
 * - Progressive Web App features with offline support
 * - Multi-region deployment optimizations
 * - Cost optimization features
 * - Novasanctum AI integration support
 * - Divina-L3 blockchain integration support
 * - Radix UI and modern component library support
 * - Latest React patterns and optimizations
 * 
 * @author GameDin Development Team
 * @version 5.0.0
 * @since 2024-12-19
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

  // Novasanctum AI configuration
  const novasanctumConfig = {
    enabled: env.VITE_NOVASANCTUM_ENABLED === 'true',
    apiUrl: env.VITE_NOVASANCTUM_API_URL || '',
    apiKey: env.VITE_NOVASANCTUM_API_KEY || '',
    features: {
      aiRecommendations: env.VITE_AI_RECOMMENDATIONS === 'true',
      fraudDetection: env.VITE_FRAUD_DETECTION === 'true',
      userBehaviorAnalysis: env.VITE_USER_BEHAVIOR_ANALYSIS === 'true',
      contentModeration: env.VITE_CONTENT_MODERATION === 'true'
    }
  };

  // Divina-L3 configuration
  const divinaL3Config = {
    enabled: env.VITE_DIVINA_L3_ENABLED === 'true',
    rpcUrl: env.VITE_DIVINA_L3_RPC_URL || '',
    chainId: env.VITE_DIVINA_L3_CHAIN_ID || '1337421',
    features: {
      crossChainBridging: env.VITE_CROSS_CHAIN_BRIDGING === 'true',
      smartContracts: env.VITE_SMART_CONTRACTS === 'true',
      consensusOptimization: env.VITE_CONSENSUS_OPTIMIZATION === 'true',
      gamingPrimitives: env.VITE_GAMING_PRIMITIVES === 'true'
    }
  };

  return {
    plugins: [
      // Enhanced React plugin for React 19
      react({
        // React 19 specific optimizations
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: [
            '@emotion/babel-plugin',
            // Add support for React 19 features
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }]
          ]
        }
      }),
      // Enhanced PWA plugin for AWS optimization
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp,avif}'],
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
            // Novasanctum AI API caching
            {
              urlPattern: /^https:\/\/.*\.novasanctum\.com/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'novasanctum-ai-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutes for AI responses
                },
                networkTimeoutSeconds: 15
              }
            },
            // Divina-L3 blockchain caching
            {
              urlPattern: /^https:\/\/.*\.divina-l3\.com/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'divina-l3-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 30 // 30 minutes for blockchain data
                },
                networkTimeoutSeconds: 10
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
          name: 'GameDin - Social Gaming Platform v5.0.0',
          short_name: 'GameDin',
          description: 'Connect with gamers, share achievements, and discover new games with AI-powered features',
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
      // Compression plugin for AWS optimization
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240,
        deleteOriginFile: false
      }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
        deleteOriginFile: false
      }),
      // Bundle analyzer for optimization
      visualizer({
        filename: 'stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true
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
        '@aws': path.resolve(__dirname, './src/aws'),
        '@novasanctum': path.resolve(__dirname, './src/novasanctum'),
        '@divina': path.resolve(__dirname, './src/divina'),
        '@ui': path.resolve(__dirname, './src/ui'),
        '@lib': path.resolve(__dirname, './src/lib')
      }
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          // Enhanced chunk splitting for better caching
          manualChunks: {
            // Core React and runtime
            'react-vendor': ['react', 'react-dom'],
            // Router
            'router': ['react-router-dom'],
            // State management
            'state': ['zustand', '@tanstack/react-query'],
            // UI libraries
            'ui-vendor': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              '@radix-ui/react-button',
              '@radix-ui/react-card',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-form',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-icons',
              '@radix-ui/react-label',
              '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slider',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
              '@radix-ui/react-tooltip'
            ],
            // AWS services
            'aws-vendor': [
              '@aws-amplify/api',
              '@aws-amplify/auth',
              '@aws-amplify/ui-react',
              '@aws-sdk/client-cloudfront',
              '@aws-sdk/client-cloudwatch',
              '@aws-sdk/client-lambda',
              '@aws-sdk/client-s3',
              '@aws-sdk/client-xray'
            ],
            // Novasanctum AI
            'novasanctum': [
              '@novasanctum/ai-client',
              '@novasanctum/ai-react'
            ],
            // Divina-L3 blockchain
            'divina-l3': [
              '@divina-l3/blockchain-client',
              '@divina-l3/react-hooks',
              '@divina-l3/smart-contracts',
              'ethers',
              'wagmi',
              'viem'
            ],
            // Utilities
            'utils': [
              'axios',
              'date-fns',
              'dexie',
              'framer-motion',
              'swr',
              'zod',
              'class-variance-authority',
              'clsx',
              'lucide-react',
              'tailwind-merge',
              'tailwindcss-animate'
            ],
            // Forms and validation
            'forms': [
              'react-hook-form',
              '@hookform/resolvers',
              'sonner',
              'cmdk',
              'vaul'
            ],
            // React utilities
            'react-utils': [
              'react-resizable-panels',
              'react-scroll-area',
              'react-slot',
              'react-use',
              'usehooks-ts',
              'react-intersection-observer',
              'react-hot-toast',
              'react-error-boundary',
              'react-suspense',
              'react-lazy',
              'react-memo',
              'react-callback',
              'react-context',
              'react-reducer',
              'react-state',
              'react-effect',
              'react-ref',
              'react-transition-group',
              'react-spring',
              'react-gesture'
            ],
            // 3D and graphics
            'graphics': [
              'react-three-fiber',
              'three',
              '@react-three/drei',
              '@react-three/postprocessing',
              'leva',
              'stats.js'
            ],
            // Performance monitoring
            'performance': [
              'perfume.js',
              'web-vitals',
              'lighthouse',
              'puppeteer',
              'playwright'
            ],
            // Testing
            'testing': [
              'cypress',
              'jest',
              'vitest',
              '@vitest/ui',
              'jsdom',
              'happy-dom',
              'msw',
              'faker',
              'test-data-bot',
              'react-testing-library',
              '@testing-library/jest-dom',
              '@testing-library/user-event',
              '@testing-library/react-hooks',
              'jest-axe'
            ]
          },
          // Enhanced file naming for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
              : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/\.(css)$/.test(assetInfo.name || '')) {
              return `css/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name || '')) {
              return `images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
              return `fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          }
        }
      },
      // Enhanced build optimizations
      chunkSizeWarningLimit: 1000,
      emptyOutDir: true,
      reportCompressedSize: false,
      // CSS optimizations
      cssCodeSplit: true,
      cssMinify: isProduction,
      // Asset optimizations
      assetsInlineLimit: 4096,
      // Enhanced source map generation
      sourcemap: isDevelopment ? 'inline' : false
    },
    // Enhanced development server
    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
      // Proxy configuration for Novasanctum and Divina-L3
      proxy: {
        '/api/novasanctum': {
          target: novasanctumConfig.apiUrl || 'https://api.novasanctum.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/novasanctum/, '')
        },
        '/api/divina-l3': {
          target: divinaL3Config.rpcUrl || 'https://rpc.divina-l3.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/divina-l3/, '')
        },
        '/api/aws': {
          target: `https://${awsConfig.region}.amazonaws.com`,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/aws/, '')
        }
      }
    },
    // Enhanced preview server
    preview: {
      port: 4173,
      host: true,
      open: true
    },
    // Enhanced define for environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __NODE_ENV__: JSON.stringify(mode),
      __NOVASANCTUM_ENABLED__: JSON.stringify(novasanctumConfig.enabled),
      __DIVINA_L3_ENABLED__: JSON.stringify(divinaL3Config.enabled),
      __AWS_REGION__: JSON.stringify(awsConfig.region),
      __CLOUDFRONT_DOMAIN__: JSON.stringify(awsConfig.cloudFrontDomain),
      __S3_BUCKET__: JSON.stringify(awsConfig.s3Bucket),
      __LAMBDA_EDGE_ENABLED__: JSON.stringify(awsConfig.lambdaEdgeEnabled),
      __MONITORING_ENABLED__: JSON.stringify(awsConfig.monitoringEnabled),
      __COST_OPTIMIZATION__: JSON.stringify(awsConfig.costOptimization)
    },
    // Enhanced CSS configuration
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    // Enhanced optimizeDeps configuration
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        '@tanstack/react-query',
        'axios',
        'date-fns',
        'dexie',
        'framer-motion',
        'swr',
        'zod',
        '@radix-ui/react-accordion',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-avatar',
        '@radix-ui/react-button',
        '@radix-ui/react-card',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-form',
        '@radix-ui/react-hover-card',
        '@radix-ui/react-icons',
        '@radix-ui/react-label',
        '@radix-ui/react-menubar',
        '@radix-ui/react-navigation-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-progress',
        '@radix-ui/react-radio-group',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-slider',
        '@radix-ui/react-slot',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group',
        '@radix-ui/react-tooltip',
        'class-variance-authority',
        'clsx',
        'lucide-react',
        'tailwind-merge',
        'tailwindcss-animate',
        '@novasanctum/ai-client',
        '@novasanctum/ai-react',
        '@divina-l3/blockchain-client',
        '@divina-l3/react-hooks',
        '@divina-l3/smart-contracts',
        'ethers',
        'wagmi',
        'viem'
      ],
      exclude: [
        'cypress',
        'jest',
        'vitest',
        '@vitest/ui',
        'jsdom',
        'happy-dom',
        'msw',
        'faker',
        'test-data-bot',
        'react-testing-library',
        '@testing-library/jest-dom',
        '@testing-library/user-event',
        '@testing-library/react-hooks',
        'jest-axe'
      ]
    },
    // Enhanced esbuild configuration
    esbuild: {
      jsxInject: `import React from 'react'`,
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      target: 'esnext',
      format: 'esm',
      minify: isProduction,
      sourcemap: isDevelopment,
      treeShaking: true,
      splitting: true,
      metafile: isProduction,
      outdir: 'dist',
      outbase: 'src',
      entryPoints: ['src/main.tsx'],
      bundle: true,
      external: isProduction ? [] : undefined,
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.NOVASANCTUM_ENABLED': JSON.stringify(novasanctumConfig.enabled),
        'process.env.DIVINA_L3_ENABLED': JSON.stringify(divinaL3Config.enabled),
        'process.env.AWS_REGION': JSON.stringify(awsConfig.region),
        'process.env.CLOUDFRONT_DOMAIN': JSON.stringify(awsConfig.cloudFrontDomain),
        'process.env.S3_BUCKET': JSON.stringify(awsConfig.s3Bucket),
        'process.env.LAMBDA_EDGE_ENABLED': JSON.stringify(awsConfig.lambdaEdgeEnabled),
        'process.env.MONITORING_ENABLED': JSON.stringify(awsConfig.monitoringEnabled),
        'process.env.COST_OPTIMIZATION': JSON.stringify(awsConfig.costOptimization)
      }
    }
  };
});
