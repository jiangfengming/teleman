# Teleman

A tiny (~2kb after gzipped) `fetch` API wrapper.

## Features
* Tiny, only about 2kb after gzipped.
* Support middleware.
* Return decoded response body.
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
new Teleman({ base, headers })
```

Creates a Teleman instance.

### base
`String`. Optional. Base URL. In browser, it's default value is `document.baseURI`.

### headers
`Object`. Optional. Default headers. It can be a simple key-value object or
[Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers) object.

## Methods

### instance.fetch()

```js
instance.fetch(url, {
  method = 'GET',
  base = this.base,
  headers,
  query,
  params = {},
  body,
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
instance.fetch('/articles/:id', { params: { id: 1 } })
```
It will use `encodeURIComponent()` to encode the values.

##### body
`Object` | `FormData` | `Blob` | `BufferSource` | `URLSearchParams` | `String`. The request body.
If the body is a plain object, it will be converted to other type according to `content-type` of `headers`:
* not set: to JSON string, and set `content-type` to `application/json`.
* `application/json`: to JSON string.
* `multipart/form-data`: to FormData.
* `application/x-www-form-urlencoded`: to URLSearchParams.


##### use
`Array<Middleware>`. Middleware functions to use. Defaults to `instance.middleware` array.  

##### ...rest
Other parameters will be set into the context object.

#### Return Value
`instance.fetch()` returns a promise.

According to `content-type` header of the response, it will resolve/reject (depends on `response.ok`) to different types:
* `application/json`: `response.json()`
* `text/*`: `response.text()`
* Others: the `response` object as is.

If any error occurs, the promise will be rejected with that error.

### Shortcut methods
```js
instance.get(url, query, options)
instance.post(url, body, options)
instance.put(url, body, options)
instance.patch(url, body, options)
instance.delete(url, query, options)
instance.head(url, query, options)
instance.purge(url, query, options)
```

### instance.use(middleware)
Add the given middleware to `instance.middleware` array. It returns `this` so is chainable.

#### Parameters
##### middleware
`Function`. The middleware function to use.

```js
instance
  .use(async(ctx, next) => {
    try {
      return await next();
    } catch (e) {
      alert(e?.message || 'fetch failed');
      throw e;
    }
  });
  .use(async(ctx, next) => {
    const start = Date.now();
    const data = await next();
    const ms = Date.now() - start;
    console.log(`${ctx.options.method} ${ctx.url.href} - ${ms}ms`);
    
    // you can modify the data then return it
    return {
      ...data,
      foo: data.foo || 0
    };
  })
```

#### ctx
```js
{
  url, // URL object
  options: { method, headers, body },
  response, // available after `await next()`
  ...rest // additional parameters passed from `instance.fetch()` options
}
```

`url` and `options` will be used to call the `fetch()` function:

```js
fetch(ctx.url.href, ctx.options)
```

You can modify the context properties to interfere the request and response.

#### next
A middleware function should receive the response body from `next()`, and can optionally modify the data.
Finally it should return the data.

## License

[MIT](LICENSE)
