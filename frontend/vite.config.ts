import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';

/**
 * Enhanced Vite Configuration for GameDin AWS Amplify Deployment
 * 
 * This configuration includes:
 * - Self-selecting optimization based on environment
 * - Advanced AWS Amplify deployment optimizations
 * - Performance monitoring and analytics
 * - Enhanced security headers
 * - Optimized caching strategies
 * - Progressive Web App features
 * 
 * @author GameDin Development Team
 * @version 4.0.0
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
  
  // AWS Amplify specific optimizations
  const amplifyOptimizations = {
    // Enhanced chunk splitting for better caching
    manualChunks: {
      vendor: ['react', 'react-dom'],
      router: ['react-router-dom'],
      ui: ['@mui/material', '@mui/icons-material', '@headlessui/react', '@heroicons/react'],
      utils: ['date-fns', 'zod', 'swr', 'framer-motion'],
      amplify: ['aws-amplify', '@aws-amplify/ui-react', '@aws-amplify/auth'],
      workbox: ['workbox-core', 'workbox-expiration', 'workbox-precaching', 'workbox-routing', 'workbox-strategies']
    },
    
    // Optimized file naming for AWS CloudFront
    output: {
      chunkFileNames: isProduction ? 'assets/[name]-[hash]-[optimization].js' : 'assets/[name].js',
      entryFileNames: isProduction ? 'assets/[name]-[hash]-[optimization].js' : 'assets/[name].js',
      assetFileNames: isProduction ? 'assets/[name]-[hash]-[optimization].[ext]' : 'assets/[name].[ext]'
    }
  };
  
  return {
    plugins: [
      react(),
      // Enhanced PWA plugin for AWS Amplify deployment
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                networkTimeoutSeconds: 10
              }
            },
            {
              urlPattern: /^https:\/\/.*\.amazonaws\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'aws-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                }
              }
            },
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
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
          // AWS Amplify specific service worker optimizations
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          sourcemap: isDevelopment
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
          // AWS Amplify specific manifest features
          categories: ['games', 'social', 'entertainment'],
          lang: 'en-US',
          dir: 'ltr'
        }
      }),
      // Enhanced compression for AWS CloudFront
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false
      }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false
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
        '@store': path.resolve(__dirname, './src/store')
      }
    },
    server: {
      port: 3000,
      host: true,
      cors: true,
      // Enhanced development server for AWS Amplify testing
      hmr: {
        overlay: true
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
          passes: 2
        },
        mangle: {
          safari10: true,
          toplevel: true
        },
        format: {
          comments: false
        }
      } : undefined,
      rollupOptions: {
        ...amplifyOptimizations,
        // Enhanced tree shaking for AWS Amplify
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false
        }
      },
      // Optimized build targets for AWS Amplify
      target: 'es2015',
      cssTarget: 'chrome80',
      chunkSizeWarningLimit: 1000,
      // AWS Amplify specific build optimizations
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      reportCompressedSize: isProduction
    },
    // Enhanced environment variables for AWS Amplify
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '4.0.0'),
      __BUILD_TIME__: JSON.stringify(env.VITE_APP_BUILD_TIME || new Date().toISOString()),
      __ENVIRONMENT__: JSON.stringify(env.VITE_APP_ENV || mode),
      __OPTIMIZATION_LEVEL__: JSON.stringify(optimizationLevel),
      __AMPLIFY_VERSION__: JSON.stringify(env.VITE_AMPLIFY_VERSION || 'gen2'),
      __AWS_REGION__: JSON.stringify(env.VITE_AWS_REGION || 'us-east-1'),
      __DEPLOYMENT_STAGE__: JSON.stringify(env.VITE_DEPLOYMENT_STAGE || mode)
    },
    // Optimized dependencies for AWS Amplify
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
        'workbox-core',
        'workbox-expiration',
        'workbox-precaching',
        'workbox-routing',
        'workbox-strategies'
      ],
      exclude: ['@aws-amplify/cli']
    },
    // AWS Amplify specific optimizations
    esbuild: {
      target: 'es2015',
      legalComments: 'none',
      drop: isProduction ? ['console', 'debugger'] : []
    },
    // Enhanced CSS processing for AWS Amplify
    css: {
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('tailwindcss'),
          // AWS Amplify specific CSS optimizations
          isProduction && require('cssnano')({
            preset: ['default', {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              colormin: true,
              minifyFontValues: true
            }]
          })
        ].filter(Boolean)
      }
    }
  };
});
