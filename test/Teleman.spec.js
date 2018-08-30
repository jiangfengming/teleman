// Passing arrow functions (“lambdas”) to Mocha is discouraged.
// https://mochajs.org/#arrow-functions
/* eslint prefer-arrow-callback: "off" */

if (typeof window !== 'undefined') {
  test(window)
} else {
  const { URL, URLSearchParams } = require('url')
  global.URL = URL
  global.URLSearchParams = URLSearchParams
  global.FormData = require('form-data')
  global.fetch = require('node-fetch')
  global.Headers = fetch.Headers
  global.Request = fetch.Request

  const Response = fetch.Response
  const { assert } = require('chai')
  const Teleman = require('../')

  test({ assert, Teleman, URL, FormData, Request, Response })
}

function test({ assert, Teleman, URL, FormData, Request, Response }) {
  describe('create instance with default options', function() {
    let api

    before(function() {
      api = new Teleman()
    })

    describe('fetch with default options', function() {
      let result

      before(async function() {
        result = await api.fetch('http://localhost:3000/headers')
      })

      it('should parse the response body if content-type is application/json', function() {
        assert.isObject(result)
      })

      it('should fetch with correct url', function() {
        assert.equal(result.url, '/headers')
      })
    })

    describe('fetch application/octet-stream response', function() {
      it('should return response object', async function() {
        const result = await api.fetch('http://localhost:3000/bin')
        assert.instanceOf(result, Response)
      })
    })

    describe('fetch with query string', function() {
      it('should fetch with correct query string', async function() {
        const result = await api.fetch('http://localhost:3000/headers', { query: 'a=1&b=2' })
        assert.equal(result.url, '/headers?a=1&b=2')
      })
    })

    describe('fetch unreachable address', function() {
      it('should throw error', async function() {
        try {
          await api.get('http://127.0.0.1:65535/')
        } catch (e) {
          assert.instanceOf(e, Error)
        }
      })
    })

    it('should throw response object if response.ok is false and content-type is other than application/json and text/*', async function() {
      try {
        await api.get('http://127.0.0.1:3000/err.bin')
      } catch (e) {
        assert.instanceOf(e, Response)
      }
    })
  })

  describe('error handler parameters', function() {
    let errArgs

    before(async function() {
      const api = new Teleman({
        error(args) {
          errArgs = args
        }
      })

      await api.get('http://127.0.0.1:65535/')
    })

    it('should have request object', function() {
      assert.instanceOf(errArgs.request, Request)
    })

    it('should have error object', function() {
      assert.instanceOf(errArgs.error, Error)
    })
  })

  describe('create instance with provided options', function() {
    let api

    before(function() {
      api = new Teleman({
        base: 'http://localhost:3000',
        requestOptions: {
          headers: {
            'X-Token': 'abcdef123456'
          }
        },

        beforeCreateRequest(url, options) {
          url = new URL(url)
          url.searchParams.append('baz', '3')
          url = url.href

          options.headers.append('X-Bar', '2')

          return { url, options }
        },

        complete(result) {
          return result
        },

        error(e) {
          throw e
        }
      })
    })

    describe('fetch with queries and headers', function() {
      let result

      before(async function() {
        result = await api.get('/?foo=1', { bar: 2 }, { headers: { 'X-Token': '123456abc' } })
      })

      it('should fetch with correct url', function() {
        assert.equal(result.request.url, 'http://localhost:3000/?foo=1&bar=2&baz=3')
      })

      it('should fetch with overrided header', function() {
        assert.equal(result.request.headers.get('X-Token'), '123456abc')
      })

      it('should inject the header by beforeCreateRequest()', function() {
        assert.equal(result.request.headers.get('X-Bar'), '2')
      })

      it('should parse the response body if content-type is text/*', function() {
        assert.equal(result.body, 'Hello World!')
      })
    })

    describe('fetch application/octet-stream response', function() {
      let result

      before(async function() {
        result = await api.get('/bin')
      })

      it('should have request object', function() {
        assert.instanceOf(result.request, Request)
      })

      it('should have response object', function() {
        assert.instanceOf(result.response, Response)
      })

      it('should have not body object', function() {
        assert.isUndefined(result.body)
      })
    })
  })

  describe('post JSON', function() {
    let requestOptions

    before(async function() {
      const api = new Teleman({
        base: 'http://localhost:3000',
        beforeCreateRequest(url, options) {
          requestOptions = options
        }
      })

      await api.post('/echo', { foo: 1 })
    })

    it('should convert plain object to JSON if type is not specified', function() {
      assert.equal(requestOptions.body, JSON.stringify({ foo: 1 }))
    })

    it('should have request content-type application/json', function() {
      assert.equal(requestOptions.headers.get('content-type'), 'application/json')
    })
  })

  describe('post form data', function() {
    let requestOptions

    before(async function() {
      const api = new Teleman({
        base: 'http://localhost:3000',
        beforeCreateRequest(url, options) {
          requestOptions = options
        }
      })

      await api.post('/echo', { foo: 1 }, { type: 'form' })
    })

    it('should convert plain object to FormData if type is specified to "form"', function() {
      assert.instanceOf(requestOptions.body, FormData)
    })
  })

  describe('HTTP methods', function() {
    let api

    before(function() {
      api = new Teleman({
        base: 'http://localhost:3000',
        complete: result => result,
        error(e) { throw e }
      })
    })

    it('should fetch with GET method', async function() {
      const result = await api.get('/headers')
      assert.equal(result.request.method, 'GET')
    })

    it('should fetch with POST method', async function() {
      const result = await api.post('/headers')
      assert.equal(result.request.method, 'POST')
    })

    it('should fetch with PUT method', async function() {
      const result = await api.put('/headers')
      assert.equal(result.request.method, 'PUT')
    })

    it('should fetch with PATCH method', async function() {
      const result = await api.patch('/headers')
      assert.equal(result.request.method, 'PATCH')
    })

    it('should fetch with DELETE method', async function() {
      const result = await api.delete('/headers')
      assert.equal(result.request.method, 'DELETE')
    })

    it('should fetch with HEAD method', async function() {
      const result = await api.head('/headers')
      assert.equal(result.request.method, 'HEAD')
    })
  })
}
