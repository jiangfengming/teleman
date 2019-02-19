# Teleman

[![CircleCI](https://img.shields.io/circleci/project/github/jiangfengming/teleman.svg)](https://circleci.com/gh/jiangfengming/teleman)
[![Codecov](https://img.shields.io/codecov/c/github/jiangfengming/teleman.svg)](https://codecov.io/gh/jiangfengming/teleman)
[![npm](https://img.shields.io/npm/dm/teleman.svg)](https://www.npmjs.com/package/teleman)
[![npm](https://img.shields.io/npm/v/teleman.svg)](https://www.npmjs.com/package/teleman)
[![license](https://img.shields.io/github/license/jiangfengming/teleman.svg)](https://github.com/jiangfengming/teleman)

A tiny (~2kb after gzipped) `fetch` API wrapper.

## Installation

```sh
npm i teleman
```

## Usage

```js
import Teleman from 'teleman'

const api = new Teleman({
  urlPrefix: 'http://api.example.com'
})

async function() {
  const article = await api.get('/articles', { id: 123 })

  // post JSON
  await api.post('/articles', { title: 'Hello', content: '# Hello' })

  // post with Content-Type: multipart/form-data
  await api.post('/upload', new FormData(document.forms[0]))
}
```

In Node.js environment, you need to add these global variables:

```js
const { URL, URLSearchParams } = require('url')
global.URL = URL
global.URLSearchParams = URLSearchParams

// https://github.com/form-data/form-data
global.FormData = require('form-data')

// https://github.com/bitinn/node-fetch
global.fetch = require('node-fetch')
global.Headers = fetch.Headers
```

## Constructor
```js
new Teleman({ urlPrefix, headers, readBody = true})
```

Creates a Teleman instance.

### urlPrefix
String. Optional. A string prepend to `url`, if `url` is not start with `http(s)://`. 

### headers
Object. Optional. Default headers. It can be a simple key-value object or
[Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers) object.

### readBody
Boolean. Optional. Defaults to `true`. Whether to auto read the response body.
According to `content-type` header of the response, it will use different methods:
* `application/json`: `response.json()`
* `text/*`: `response.text()`
* `multipart/form-data`: `response.formData()`
* Others: Won't read, manully handle the response in the middleware.

If you turn off `readBody`, you need to handle response body in the middleware.
```js
const api = new Teleman({ readBody: false })

api.use(async(ctx, next) => {
  await next()
  return ctx.response.json()
})
```

## Instance methods

### teleman.fetch()

```js
teleman.fetch(url, {
  method = 'GET',
  urlPrefix = this.urlPrefix,
  headers,
  query,
  params = {},
  body,
  readBody = this.readBody,
  use = this.middleware,
  useBefore = [],
  useAfter = [],
  ...rest } = {}
)
```

#### urlString
The URL of the request.

#### urlPrefix
String. URL prefix.

#### method
String. HTTP methods. 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'. Defaults to 'GET'.

#### headers
Object | [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers). HTTP headers.
It will be merged with instance's default headers.

#### query
String | Object | Array | [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).
The query string appends to the URL. It takes the same format as 
[URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams) constructor's param.

#### params
Object. URL path params.
```js
Teleman.fetch('/articles/:id', { params: { id: 1 } })
```
It will use `encodeURIComponent()` to encode the values.

#### body
Object | FormData | Blob | BufferSource | URLSearchParams | String. The request body.
If body is a plain object, it will be convert to other type according to `content-type` of `headers` option.
* not set or `application/json`: to JSON string, and set `content-type` if hasn't set.
* `multipart/form-data`: to FormData.
* `application/x-www-form-urlencoded`: to URLSearchParams.

#### readBody
Boolean. Whether to read response body.  

#### use
Array. Middleware functions to use. Defaults to the middleware functions added by `teleman.use()`.  

#### useBefore
Array. Applies middleware functions before `use`.  

#### useAfter
Array. Applies middleware functions after `use`.  

#### ...rest
Other params will be set into the context object.

### Shortcut methods
```js
teleman.get(url, query, options)
teleman.post(url, body, options)
teleman.put(url, body, options)
teleman.patch(url, body, options)
teleman.delete(url, query, options)
teleman.head(url, query, options)
```

### teleman.use(middleware)
Add the given middleware function to the instance.

```js
api.use(async(ctx, next) => {
  const start = Date.now()
  const data = await next()
  const ms = Date.now() - start
  console.log(`${ctx.options.method} ${ctx.url} - ${ms}ms`)
  return data
})

api.use(async(ctx, next) => {
  try {
    return await next()
  } catch (e) {
    alert(e ? e.message || e : 'fetch failed')
    throw e
  }
})
```

#### ctx
```js
{
  url,
  options: { method, headers, body },
  readBody,
  ...rest
}
```
`url` and `options` are params of `fetch()`:
```js
`fetch(ctx.url, ctx.options)`
```

You can modify the context properties to interfere the request and response.

#### next
A middleware function should receive response body from `next()`, and can optionally transform the data.
Finally it should return the data.

## Static methods
You can also use Teleman directly without creating an instance.
```js
import Teleman from 'teleman'

Teleman.get(url, query, options)
Teleman.post(url, body, options)
Teleman.put(url, body, options)
Teleman.patch(url, body, options)
Teleman.delete(url, query, options)
Teleman.head(url, query, options)

Teleman.use(middleware)
```

`Teleman.default` is the default instance.

## License

[MIT](LICENSE)

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com
