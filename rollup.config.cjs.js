import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/index.mjs',

  output: {
    format: 'cjs',
    name: 'Teleman',
    file: 'dist/Teleman.js',
    sourcemap: true
  },

  plugins: [
    resolve(),
    commonjs()
  ],

  external: ['koa-compose']
}
