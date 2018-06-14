import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'Teleman',
    file: 'dist/Teleman.umd.js',
    sourcemap: true
  },
  plugins: [
    babel()
  ]
}
