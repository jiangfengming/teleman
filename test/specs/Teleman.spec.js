// Passing arrow functions (“lambdas”) to Mocha is discouraged.
// https://mochajs.org/#arrow-functions
/* eslint prefer-arrow-callback: "off" */

const Teleman = require('../../')
const { assert } = require('chai')

describe('instance with default options', function() {
  let api

  before(function() {
    api = new Teleman()
  })

  describe('fetch with default options', function() {
    let result

    before(async function() {
      result = await api.fetch('http://localhost:3000/options')
    })

    it('should fetch with correct url', function() {
      assert.equal(result.url, '/options')
    })
  })
})

describe('fetch with options', function() {
  let result

  before(async function() {
    const api = new Teleman({
      base: 'http://localhost:3000',
      fetchOptions: {
        headers: {
          'X-Token': 'abcdef123456'
        }
      },

      beforeFetch(url, options) {
        url = new URL(url)
        url.searchParams.append('baz', '3')
        url = url.href

        options.headers.append('X-Track-Id', '12345')

        return { url, options }
      },

      complete(result) {
        return result
      }
    })

    result = await api.get('/?foo=1', { bar: 2 })
  })

  it('should fetch with correct url', function() {
    assert.equal(result.request.url, 'http://localhost:3000/?foo=1&bar=2&baz=3')
  })

  it('should fetch with correct header', function() {
    assert.equal(result.request.headers.get('X-Token'), 'abcdef123456')
  })

  it('should inject the header by beforeFetch()', function() {
    assert.equal(result.request.headers.get('X-Track-Id'), '12345')
  })

  it('should has text body if content-type is text/*', function() {
    assert.equal(result.body, 'Hello World!')
  })
})
