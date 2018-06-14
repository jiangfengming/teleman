// Passing arrow functions (“lambdas”) to Mocha is discouraged.
// https://mochajs.org/#arrow-functions
/* eslint prefer-arrow-callback: "off" */

const Teleman = require('../../')
const { assert } = require('chai')

describe('Teleman constructor', function() {
  it('should create a Teleman instance', function() {
    const api = new Teleman()
    assert.instanceOf(api, Teleman)
  })
})

/*
describe('Teleman instance', function() {
  const api = new Teleman({
    base: 'http://localhost:3000'
  })

  it('should ', async function() {
    const res = await api.get('/')
    const body = await res.text()
    assert.equal(body, 'Hello World!')
  })
})
 */
