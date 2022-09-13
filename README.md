# Teleman

A tiny (~2kb after gzipped) `fetch` API wrapper.

## Features
* Tiny, only about 2kb after gzipped.
* Support middleware.
* Return decoded response body by default.
* Handle `response.ok` for you.

## Installation

```sh
npm i teleman
```

NOTE: The code is written in ES2020 syntax and not transpiled.
To use it in old browsers, you should transpile the code using tools such as Babel.

## Usage

```js
import Teleman from 'teleman'

async function main() {
  const api = new Teleman({
    base: 'http://api.example.com'
  });

  const article = await api.get('/articles', { id: 123 });

  // post JSON
  await api.post('/articles', { title: 'Hello', content: '# Hello' });

  // post with Content-Type: multipart/form-data
  await api.post('/upload', new FormData(document.forms[0]));
}
```

### Singleton
You can also use Teleman directly without creating an instance.
```js
import { teleman } from 'teleman';

teleman.get(url, query, options);
teleman.post(url, body, options);
teleman.put(url, body, options);
teleman.patch(url, body, options);
teleman.delete(url, query, options);
teleman.head(url, query, options);
teleman.purge(url, query, options);
teleman.use(middleware);
```

## Constructor
```js
new Teleman({ base, headers, parseResponseBody = true, throwFailedResponse = true})
```

Creates a Teleman instance.

### base
`String`. Optional. Base URL. In browser, it's default value is `document.baseURI`.

### headers
`Object`. Optional. Default headers. It can be a simple key-value object or
[Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers) object.

### parseResponseBody
`Boolean`. Optional. Defaults to `true`. Whether to auto read the response body.
According to `content-type` header of the response, it will use different methods:
* `application/json`: `response.json()`
* `text/*`: `response.text()`
* `multipart/form-data`: `response.formData()`
* Others: return `response` object as is.

If you turn off `parseResponseBody`, you need to handle response body in the middleware.
```js
const api = new Teleman({ parseResponseBody: false })

api.use(async(ctx, next) => {
  const res = await next();
  return res.json();
});
```

### throwFailedResponse
`Boolean`. Optional. Defaults to `true`. If `response.ok` is `false`, throw the response body.

## Instance methods

### teleman.fetch()

```js
teleman.fetch(url, {
  method = 'GET',
  base = this.base,
  headers,
  query,
  params = {},
  body,
  parseResponseBody = this.parseResponseBody,
  throwFailedResponse = this.throwFailedResponse,
  use = this.middleware,
  ...rest 
} = {})
```

#### Parameters

##### url
`String`. The URL of the request. If it's a relative URL, it's relative to `base` parameter.

##### base
`String`. Base URL. The request URL will be `new URL(url, base)`.

##### method
`String`. HTTP methods. `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `PURGE`. Defaults to 'GET'.

##### headers
`Object` | [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers). HTTP headers.
It will be merged with instance's default headers.

##### query
`String` | `Object` | `Array` | [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).
The query string appends to the URL. It takes the same format as 
[URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams) constructor's param.

##### params
`Object`. URL path params.
```js
teleman.fetch('/articles/:id', { params: { id: 1 } })
```
It will use `encodeURIComponent()` to encode the values.

##### body
`Object` | `FormData` | `Blob` | `BufferSource` | `URLSearchParams` | `String`. The request body.
If the body is a plain object, it will be converted to other type according to `content-type` of `headers`:
* not set: to JSON string, and set `content-type` to `application/json`.
* `application/json`: to JSON string.
* `multipart/form-data`: to FormData.
* `application/x-www-form-urlencoded`: to URLSearchParams.

##### parseResponseBody
`Boolean`. Whether to read response body.  

##### throwFailedResponse
`Boolean`. Whether to throw when `response.ok` is `false`.

##### use
`Array<Middleware>`. Middleware functions to use. Defaults to `instance.middleware` array.  

##### ...rest
Other params will be set into the context object.

#### Returns
`teleman.fetch()` returns a promise.
* If `response.ok` is `true`, the promise will be resolved with the response body, otherwise it will be rejected with
the response body.
* If `parseResponseBody` is set to `false`, or `content-type` can't be handled, the promise will be resolved or rejected with
no value, depending on `response.ok`. In this case, you should handle the response your self in the middleware.
* If any error occurs, the promise will be rejected with the error.

### Shortcut methods
```js
teleman.get(url, query, options)
teleman.post(url, body, options)
teleman.put(url, body, options)
teleman.patch(url, body, options)
teleman.delete(url, query, options)
teleman.head(url, query, options)
teleman.purge(url, query, options)
```

### teleman.use(middleware)
Add the given middleware to `instance.middleware` array.

#### Parameters
##### middleware
`Function`. The middleware function to use.

```js
api.use(async(ctx, next) => {
  const start = Date.now();
  const data = await next();
  const ms = Date.now() - start;
  console.log(`${ctx.options.method} ${ctx.url.href} - ${ms}ms`);
  return data;
});

api.use(async(ctx, next) => {
  try {
    return await next();
  } catch (e) {
    alert(e ? e.message || e : 'fetch failed');
    throw e;
  }
});
```

#### ctx
```js
{
  url, // URL object
  options: { method, headers, body },
  response, // available after `await next()`
  parseResponseBody,
  ...rest
}
```
`url` and `options` are params of `fetch()`:
```js
fetch(ctx.url.href, ctx.options)
```

You can modify the context properties to interfere the request and response.

#### next
A middleware function should receive response body from `next()`, and can optionally transform the data.
Finally it should return the data.

## License

[MIT](LICENSE)
