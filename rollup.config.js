import json from '@rollup/plugin-json';
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
    ],
    output: [
      { file: pkg.main, format: 'cjs', exports: 'default' },
      { file: pkg.module, format: 'esm' },
    ],
    plugins: [json()],
  },
];
