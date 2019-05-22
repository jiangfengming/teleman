import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.mjs',

  output: {
    format: 'esm',
    file: 'dist/Teleman.mjs',
    sourcemap: true
  },

  plugins: [
    resolve(),
    commonjs(),
    babel()
  ]
}
