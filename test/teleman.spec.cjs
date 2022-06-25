// Passing arrow functions (“lambdas”) to Mocha is discouraged.
// https://mochajs.org/#arrow-functions
/* eslint prefer-arrow-callback: "off" */

if (typeof window !== 'undefined') {
  test(window);
} else {
  const { assert } = require('chai');
  const { Teleman } = require('../dist/index.cjs');

  test({ assert, Teleman, Response });
}

function test({ assert, Teleman }) {
  describe('Teleman', function() {
    let api, api2;

    before(function() {
      api = new Teleman({
        base: 'http://localhost:3000'
      });

      api2 = new Teleman({
        base: 'http://localhost:3000',

        headers: {
          foo: '1',
          bar: '2'
        }
      });

      api2.use(async(ctx, next) => {
        try {
          return await next();
        } catch (e) {
          if (e instanceof Error) {
            throw e;
          } else {
            throw {
              code: ctx.response.status,
              message: e
            };
          }
        }
      });
    });

    it('should fetch with correct url', async function() {
      await api.fetch('/', { use: [ctx => assert.equal(ctx.url.href, 'http://localhost:3000/')] });
    });

    it('should read the response body if content-type is application/json', async function() {
      const result = await api.fetch('/headers');
      assert.isObject(result);
    });

    it.skip('should read the response body if content-type is multipart/form-data', async function() {
      const result = await api.fetch('/form');
      assert.instanceOf(result, FormData);
    });

    it('query can be object', async function() {
      await api.fetch('/', {
        query: { a: 1, b: 2 },
        use: [ctx => assert.equal(ctx.url.href, 'http://localhost:3000/?a=1&b=2')]
      });
    });

    it('query can be string', async function() {
      await api.fetch('/', {
        query: 'a=1&b=2',
        use: [ctx => assert.equal(ctx.url.href, 'http://localhost:3000/?a=1&b=2')]
      });
    });

    it('should convert body type of object to JSON by default', async function() {
      await api.post('/', { a: 1, b: 2 }, { use: [ctx => {
        assert.equal(ctx.options.headers.get('content-type'), 'application/json');
        assert.equal(ctx.options.body, '{"a":1,"b":2}');
      }] });
    });

    it('should convert body type of object to FormData if content-type is set to multipart/form-data', async function() {
      await api.post('/', { a: 1, b: 2 }, {
        headers: { 'content-type': 'multipart/form-data' },
        use: [ctx => assert.instanceOf(ctx.options.body, FormData)]
      });
    });

    it('should convert body type of object to URLSearchParams if content-type is set to application/x-www-form-urlencoded', async function() {
      await api.post('/', { a: 1, b: 2 }, {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        use: [ctx => assert.instanceOf(ctx.options.body, URLSearchParams)]
      });
    });

    it('should merge default headers with headers param', async function() {
      await api2.fetch('/', {
        headers: { foo: '11', baz: '3' },

        use: [ctx => {
          assert.equal(ctx.options.headers.get('foo'), '11');
          assert.equal(ctx.options.headers.get('bar'), '2');
          assert.equal(ctx.options.headers.get('baz'), '3');
        }]
      });
    });

    it('should throw response body if response.ok is false', async function() {
      try {
        await api.get('/404');
      } catch (e) {
        assert.equal(e, 'Not Found');
      }
    });

    it('should throw error if fetch failed', async function() {
      try {
        await api.get('http://127.0.0.1:65535/');
      } catch (e) {
        assert.instanceOf(e, Error);
      }
    });

    it('should not throw if throwFailedResponse set to false', async function() {
      await api.fetch('/err.bin', { throwFailedResponse: false });
    });

    it('should run middleware', async function() {
      try {
        await api2.get('/404');
      } catch (e) {
        assert.deepEqual(e, { code: 404, message: 'Not Found' });
      }
    });

    it('should request with PUT method', async function() {
      await api.put('/', null, { use: [ctx => assert.equal(ctx.options.method, 'PUT')] });
    });

    it('should request with PATCH method', async function() {
      await api.patch('/', null, { use: [ctx => assert.equal(ctx.options.method, 'PATCH')] });
    });

    it('should request with DELETE method', async function() {
      await api.delete('/', null, { use: [ctx => assert.equal(ctx.options.method, 'DELETE')] });
    });

    it('should request with HEAD method', async function() {
      await api.head('/', null, { use: [ctx => assert.equal(ctx.options.method, 'HEAD')] });
    });
  });
}
