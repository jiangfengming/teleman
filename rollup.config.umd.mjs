import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.mjs',
  output: {
    format: 'umd',
    name: 'Teleman',
    file: 'dist/Teleman.js',
    sourcemap: true
  },
  plugins: [
    babel()
  ]
}
