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

  const Response = fetch.Response
  const { assert } = require('chai')
  const Teleman = require('../')

  test({ assert, Teleman, Response })
}

function test({ assert, Teleman }) {
  describe('Teleman', function() {
    let api, api2

    before(function() {
      api = new Teleman({
        urlPrefix: 'http://localhost:3000'
      })

      api2 = new Teleman({
        urlPrefix: 'http://localhost:3000',
        headers: {
          foo: '1',
          bar: '2'
        }
      })
    })

    it('should fetch with correct url', async function() {
      await api.fetch('/', { use: [ctx => assert.equal(ctx.url, 'http://localhost:3000/')] })
    })

    it('should parse the response body if content-type is application/json', async function() {
      const result = await api.fetch('/headers')
      assert.isObject(result)
    })

    it('query can be object', async function() {
      await api.fetch('/', {
        query: { a: 1, b: 2 },
        use: [ctx => assert.equal(ctx.url, 'http://localhost:3000/?a=1&b=2')]
      })
    })

    it('query can be string', async function() {
      await api.fetch('/', {
        query: 'a=1&b=2',
        use: [ctx => assert.equal(ctx.url, 'http://localhost:3000/?a=1&b=2')]
      })
    })

    it('should convert body type of object to JSON by default', async function() {
      await api.post('/', { a: 1, b: 2 }, { use: [ctx => {
        assert.equal(ctx.options.headers.get('content-type'), 'application/json')
        assert.equal(ctx.options.body, '{"a":1,"b":2}')
      }] })
    })

    it('should convert body type of object to FormData if content-type is set to multipart/form-data', async function() {
      await api.post('/', { a: 1, b: 2 }, {
        headers: { 'content-type': 'multipart/form-data' },
        use: [ctx => assert.instanceOf(ctx.options.body, FormData)]
      })
    })

    it('should convert body type of object to URLSearchParams if content-type is set to application/x-www-form-urlencoded', async function() {
      await api.post('/', { a: 1, b: 2 }, {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        use: [ctx => assert.instanceOf(ctx.options.body, URLSearchParams)]
      })
    })

    it('should merge default headers with headers param', async function() {
      await api2.fetch('/', {
        headers: { foo: '11', baz: '3' },
        use: [ctx => {
          assert.equal(ctx.options.headers.get('foo'), '11')
          assert.equal(ctx.options.headers.get('bar'), '2')
          assert.equal(ctx.options.headers.get('baz'), '3')
        }]
      })
    })

    it('should throw response body if response.ok is false', async function() {
      try {
        await api.get('/404')
      } catch (e) {
        assert.equal(e, 'Not Found')
      }
    })

    it('should throw error if fetch failed', async function() {
      try {
        await api.get('http://127.0.0.1:65535/')
      } catch (e) {
        assert.instanceOf(e, Error)
      }
    })
  })
}
