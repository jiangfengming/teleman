import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'HttpApi',
    file: 'dist/HttpApi.umd.js'
  },
  plugins: [
    babel()
  ]
}
