import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      plugins: [react()],
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: !isProduction,
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
          },
          output: {
            entryFileNames: 'assets/[name].[hash].js',
            chunkFileNames: 'assets/[name].[hash].js',
            assetFileNames: 'assets/[name].[hash].[ext]',
          },
        },
        minify: isProduction ? 'esbuild' : false,
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      css: {
        modules: {
          localsConvention: 'camelCaseOnly',
        },
        preprocessorOptions: {
          scss: {
            additionalData: `@import "@/styles/variables.scss";`,
          },
        },
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
        esbuildOptions: {
          target: 'es2020',
        },
      },
      server: {
        port: 3000,
        open: !isProduction,
      },
      preview: {
        port: 3000,
        open: !isProduction,
      },
      esbuild: {
        jsxInject: `import React from 'react'`,
      },
    };
});
