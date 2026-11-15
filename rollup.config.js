import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/g3.ts',
    output: [
      {
        name: 'g3',
        file: 'dist/g3.js',
        format: 'umd',
        sourcemap: true,
      },
      {
        file: 'dist/g3.min.js',
        format: 'iife',
        name: 'g3',
        sourcemap: true,
        plugins: [ terser() ],
      },
      {
        file: 'dist/g3.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      typescript({ tsconfig: './tsconfig.json' }),
      injectProcessEnv({
        NODE_ENV: process.env.NODE_ENV,
      }),
    ],
  },
  {
    input: 'src/g3-contrib.ts',
    output: [
      {
        name: 'g3',
        file: 'dist/g3-contrib.js',
        format: 'umd',
        sourcemap: true,
      },
      {
        file: 'dist/g3-contrib.min.js',
        format: 'iife',
        name: 'g3',
        sourcemap: true,
        plugins: [ terser() ],
      },
      {
        file: 'dist/g3-contrib.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      typescript({ tsconfig: './tsconfig.json' }),
      injectProcessEnv({
        NODE_ENV: process.env.NODE_ENV,
      }),
    ],
  },
];
