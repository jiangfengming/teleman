export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'dist/Teleman.node.js',
    strict: false,
    sourcemap: true,
    banner: `
const { URL, URLSearchParams } = require('url')
const FormData = require('form-data')
const fetch = require('node-fetch')
const Headers = fetch.Headers
const Request = fetch.Request
`
  }
}
