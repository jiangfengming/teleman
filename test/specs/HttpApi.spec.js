// Passing arrow functions (“lambdas”) to Mocha is discouraged.
// https://mochajs.org/#arrow-functions
/* eslint prefer-arrow-callback: "off" */

const HttpApi = require('../../')
const { assert } = require('chai')

describe('HttpApi constructor', function() {
  it('should create a HttpApi instance', function() {
    const api = new HttpApi()
    assert.instanceOf(api, HttpApi)
  })
})

/*
describe('HttpApi instance', function() {
  const api = new HttpApi({
    base: 'http://localhost:3000'
  })

  it('should ', async function() {
    const res = await api.get('/')
    const body = await res.text()
    assert.equal(body, 'Hello World!')
  })
})
 */
