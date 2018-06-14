import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    format: 'es',
    file: 'dist/Teleman.esm.js',
    sourcemap: true
  },
  plugins: [
    babel()
  ]
}
