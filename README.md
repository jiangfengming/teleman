# teleman

[![CircleCI](https://img.shields.io/circleci/project/github/wallstreetcn/teleman.svg)](https://github.com/wallstreetcn/teleman)
[![Codecov](https://img.shields.io/codecov/c/github/wallstreetcn/teleman.svg)](https://github.com/wallstreetcn/teleman)
[![npm](https://img.shields.io/npm/dm/teleman.svg)](https://www.npmjs.com/package/teleman)
[![npm](https://img.shields.io/npm/v/teleman.svg)](https://www.npmjs.com/package/teleman)
[![license](https://img.shields.io/github/license/wallstreetcn/teleman.svg)](https://github.com/wallstreetcn/teleman)

A browser and node.js fetch API wrapper.

## Installation

```sh
npm i teleman
```

## Usage

```js
import Teleman from 'teleman'

const api = new Teleman({
  base: 'http://api.example.com/services',
  fetchOptions: {
    headers: {
      token: 'abcdefg123456'
    }
  },
  complete(res, body) {
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

## Constructor

### new Teleman({ base, headers, fetchOptions, complete })

Creates a Teleman instance.

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

`complete`: Function. Optional. The function to handle the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.  
Function signature:

```js
function complete(response, body) { }
```

`response` is the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.
If the response type is JSON, `body` is the parsed JSON object, otherwise `body` is `undefined`.
The return data will be the result of the promise returned by `teleman.fetch()`.

The `complete` is usually used to
* Transforms the response object to the data type you want
* Throws error if the business code is wrong.

If `complete` isn't provided, 


## Instance methods

### teleman.fetch(url, { method, headers, query, body, type })

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
teleman.get(url, query, options)
teleman.post(url, body, options)
teleman.put(url, body, options)
teleman.patch(url, body, options)
teleman.delete(url, query, options)
teleman.options(url, query, options)
teleman.head(url, query, options)
```

## License

[MIT](LICENSE)

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com
