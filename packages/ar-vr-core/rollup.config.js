import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

const isProduction = process.env.NODE_ENV === 'production';

const baseConfig = {
  input: 'src/index.ts',
  external: ['react', 'react-dom', 'three'],
  plugins: [
    peerDepsExternal(),
    nodeResolve({
      browser: true,
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    }),
    commonjs(),
    json(),
    esbuild({
      include: /\.[jt]sx?$/,
      exclude: /node_modules/,
      sourceMap: true,
      target: 'es2018',
      jsx: 'automatic',
      tsconfig: 'tsconfig.json',
      loaders: {
        '.json': 'json',
      },
    }),
    isProduction &&
      terser({
        format: {
          comments: false,
        },
      }),
    isProduction &&
      visualizer({
        filename: 'bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
  ],
};

const esmConfig = {
  ...baseConfig,
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
};

const cjsConfig = {
  ...baseConfig,
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  ],
};

const dtsConfig = {
  input: 'dist/types/src/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts()],
};

export default isProduction
  ? [esmConfig, cjsConfig, dtsConfig]
  : [esmConfig, cjsConfig];
