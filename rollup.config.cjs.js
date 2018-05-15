export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'dist/HttpApi.node.js',
    strict: false,
    banner: `
const { URL, URLSearchParams } = require('url')
const FormData = require('form-data')
const fetch = require('node-fetch')
const Headers = fetch.Headers
`
  }
}
