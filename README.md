# teleman

[![CircleCI](https://img.shields.io/circleci/project/github/jiangfengming/teleman.svg)](https://circleci.com/gh/jiangfengming/teleman)
[![Codecov](https://img.shields.io/codecov/c/github/jiangfengming/teleman.svg)](https://codecov.io/gh/jiangfengming/teleman)
[![npm](https://img.shields.io/npm/dm/teleman.svg)](https://www.npmjs.com/package/teleman)
[![npm](https://img.shields.io/npm/v/teleman.svg)](https://www.npmjs.com/package/teleman)
[![license](https://img.shields.io/github/license/jiangfengming/teleman.svg)](https://github.com/jiangfengming/teleman)

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

  requestOptions: {
    headers: {
      'X-Token': 'abcdefg123456'
    }
  },
  
  complete({ request, response, body }) {
    if (response.ok) {
      return body
    } else {
      throw body
    }
  },

  error({ request, error }) {
    throw error
  }
})

api.get('/articles', { id: 123 }).then(data => {
  console.log(data)
})

// post JSON
api.post('/articles', { title: 'Hello', content: '# Hello' })

// post with Content-Type: multipart/form-data
api.post('/upload', new FormData(document.forms[0]))
api.post('/upload', { file: inputElement.files[0] }, { type: 'form' })
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
global.Request = fetch.Request
```

## Constructor
```js
new Teleman({ base, requestOptions, beforeCreateRequest, complete, error })
```

Creates a Teleman instance.

Params:

### base
String. Optional. Base path of your http service. e.g., `https://api.example.com/services`.

### requestOptions
Object. Optional. Default options to create a request. See [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request) for details.

### beforeCreateRequest
Function. Optional. Get called right before [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request). Here is the last chance to modify `url` and `options`.

```js
function beforeCreateRequest(url, options) {
  console.log(url, options)

  if (store.user.token) {
    options.headers.set('X-Token', store.user.token)
  }
  
  // if you modified the url or replaced the options object entirely, please return it back.
  // otherwise you can omit the return statement.
  return { url, options }
}
```
`url` and `options` are parameters that would pass to [new Request(url, options)](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request).  
`options.headers` has been transformed to [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object.  

### complete
Function. Optional. The function to handle the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.  

```js
function complete({ request, response, body }) {

}
```

`request`: the [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object.  
`response`: the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.  
`body`: the response body. If response `content-type` is:
* `application/json`: `body` is the parsed JSON object.
* `text/*`: `body` is the string value of response body.
* otherwise, `body` is undefined.

The return value of `complete` handler will be the resolved value of `teleman.fetch()`.

If `complete` isn't provided, `teleman.fetch()` will be resolved to:
* `body` if response `content-type` is `application/json` or `text/*`.
* `response` object otherwise.


## Instance methods

### teleman.fetch(url, { method, headers, query, body, type })

Params:  
`url`: String. The url of the request. The final url will be `base + url + querystring`.  
`method`: String. HTTP methods. 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'. Defaults to 'GET'.  
`headers`: Object | [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers). HTTP headers.  
`query`: String | Object | Array | [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).
The URL queries. String/Object/Array type will be used to create a URLSearchParams instance.  
`body`: Object | FormData | Blob | BufferSource | URLSearchParams | String. Any body that you want to add to your request.
Note that a request using the GET or HEAD method cannot have a body.  
`type`: String. `'json'` or `'form'`.
* If `type` is not defined and `body` is a plain object, `body` will be transformed to JSON.
* If `type` is `'json'`, `body` will be transformed to JSON.
* If `type` is `'form'` and `body` is a key-value object, `body` will be transformed to `FormData` with `formData.append(name, value)`.

#### Request method aliases

```js
teleman.get(url, query, options)
teleman.post(url, body, options)
teleman.put(url, body, options)
teleman.patch(url, body, options)
teleman.delete(url, query, options)
teleman.head(url, query, options)
```

## License

[MIT](LICENSE)

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com
