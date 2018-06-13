# HttpApi

[![CircleCI](https://img.shields.io/circleci/project/github/fenivana/HttpApi.svg)](https://github.com/fenivana/HttpApi)
[![Codecov](https://img.shields.io/codecov/c/github/fenivana/HttpApi.svg)](https://github.com/fenivana/HttpApi)
[![npm](https://img.shields.io/npm/dm/@fenivana/http-api.svg)](https://www.npmjs.com/package/@fenivana/http-api)
[![npm](https://img.shields.io/npm/v/@fenivana/http-api.svg)](https://www.npmjs.com/package/http-api)
[![license](https://img.shields.io/github/license/fenivana/HttpApi.svg)](https://github.com/fenivana/HttpApi)


A cross-platform fetch API wrapper.

## Installation

```sh
npm i @fenivana/http-api
```

## Usage

```js
import HttpApi from '@fenivana/http-api'

const api = new HttpApi({
  base: 'http://api.example.com/services',
  fetchOptions: {
    headers: {
      token: 'abcdefg123456'
    }
  },
  responseHandler(res, body) {
    if (body.code) {
      throw body
    } else {
      return body.data
    }
  }
})

api.get('/articles', { id: 123 }).then(data => {
  console.log(data)
})

// post JSON
api.post('/articles', { title: 'Hello', content: '# Hello' })

// multipart/form-data upload
api.post('/upload', new FormData(document.forms[0]))
api.post('/upload', { file: inputElement.files[0] }, { type: 'form' })
```

## APIs

### new HttpApi({ base, headers, fetchOptions, responseHandler })

Creates a HttpApi instance.

Params:  
`base`: String. Optional. Base path of your http service. e.g., `https://api.example.com/services`.  
`fetchOptions`: Object. Optional. Default fetch options. See [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for details.  
`beforeFetch`: Function. Optional. Get called right before `fetch(url, options)`. Here is the last chance to modify `url` and `options`.  
Function signature:

```js
function beforeFetch(url, options) {
  console.log(url, options)

  if (store.user.token) {
    options.headers.set('token', store.user.token)
  }
  
  // if you modified the url or replaced the options object entirely, please return it back.
  // otherwise you can omit the return statement.
  return { url, options }
}
```
`url` and `options` are parameters that would pass to `fetch()` function.
`options.headers` has been transformed to [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object.  

`responseHandler`: Function. Optional. The function to handle the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.  
Function signature:

```js
function responseHandler(response, body) { }
```

`response` is the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.
If the response type is JSON, `body` is the parsed JSON object, otherwise `body` is `undefined`.
The return data will be the result of the promise returned by `httpApi.fetch()`.

The `responseHandler` is usually used to
* Transforms the response object to the data type you want
* Throws error if the business code is wrong.

If `responseHandler` isn't provided, 
### httpApi.fetch(url, { method, headers, query, body, type })

Params:  
`url`: String. The url of the request. The final url will be `base + url + querystring`.  
`method`: String. HTTP methods. 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'. Defaults to 'GET'.
`headers`: Object | [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers). HTTP headers.  
`query`: String | Object | Array | [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).
The URL queries. String/Object/Array type will be used to create a URLSearchParams instance.  
`body`: Object | FormData | Blob | BufferSource | URLSearchParams | String. Any body that you want to add to your request.
Note that a request using the GET or HEAD method cannot have a body.  
`type`: String. `'json'` or `'form'`.
* If `type` is not defined and `body` is a plain object, `body` will be transformed to JSON.
* If `type` is `'json'`, `body` will be transformed to JSON.
* If `type` is `'form'` and `body` is a key-value object, `body` will be transformed to `FormData` with `formData.append(name, value)`.

#### HTTP method shortcut alias

```js
httpApi.get(url, query, options)
httpApi.post(url, body, options)
httpApi.put(url, body, options)
httpApi.patch(url, body, options)
httpApi.delete(url, query, options)
httpApi.options(url, query, options)
httpApi.head(url, query, options)
```

## License

[MIT](LICENSE)

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com
