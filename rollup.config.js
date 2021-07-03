import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

export default [
  {
    input: 'src/g3.js',
    output: [
      {
        name: 'g3',
        file: 'dist/g3.js',
        format: 'umd'
      },
      {
        file: 'dist/g3.min.js',
        format: 'iife',
        name: 'g3',
        plugins: [ terser() ]
      }
    ],
    plugins: [
      resolve(),
      injectProcessEnv({
          NODE_ENV: process.env.NODE_ENV
      }),
    ]
  },
  {
    input: 'src/g3-examples.js',
    output: [
      {
        name: 'g3',
        file: 'dist/g3-examples.js',
        format: 'umd'
      },
      {
        file: 'dist/g3-examples.min.js',
        format: 'iife',
        name: 'g3',
        plugins: [ terser() ]
      }
    ],
    plugins: [
      resolve(),
      injectProcessEnv({
          NODE_ENV: process.env.NODE_ENV
      }),
    ]
  },
];
