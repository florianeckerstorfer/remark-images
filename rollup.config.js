import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    external: [
      'sharp',
      'probe-image-size',
      'unist-util-visit-parents',
      'fs',
      'path',
      'debug',
    ],
    output: [
      { file: pkg.main, format: 'cjs', exports: 'default' },
      { file: pkg.module, format: 'esm' },
    ],
    plugins: [json(), nodeResolve()],
  },
];
