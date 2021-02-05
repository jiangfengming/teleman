import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',

  output: {
    format: 'esm',
    file: 'dist/index.js',
    sourcemap: true
  },

  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};
