import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  external: [
    'sharp',
    'probe-image-size',
    'unist-util-visit-parents',
    'fs',
    'path',
    'debug',
  ],
  output: { file: 'dist/remark-images.js', format: 'esm' },
  plugins: [json(), nodeResolve()],
};
