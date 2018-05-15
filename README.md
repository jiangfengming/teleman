# HttpApi
A cross-platform fetch API wrapper.

## Usage

```js
import HttpApi from 'httpapi'

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

`responseHandler`: Function. Optional. The function to handle the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.
Function signature:

```js
function responseHandler(response, body) { }
```

`response` is the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.
If the response type is JSON, `body` is the parsed JSON object, otherwise `body` is `undefined`.
The return data will be the result of `httpApi.get()`, `httpApi.post()`, etc...

The `responseHandler` is usually used to
* Transforms the response object to the data type you want
* Throws error if the business code is wrong.

### httpApi.fetch(url, { method, headers, query, body, type })

Params:  
`url`: String. The url of the request. The final url will be `base + url + querystring`.
`method`: String. HTTP methods. 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'. Defaults to 'GET'.
`headers`: Object | [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers). HTTP headers.
`query`: String | Object | Array | [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).
The URL queries. String/Object/Array type will be used to create a URLSearchParams instance.  
`body`: Object | FormData | Blob | BufferSource | URLSearchParams | String. Any body that you want to add to your request.
Note that a request using the GET or HEAD method cannot have a body.  
`type`: String. 'json' or 'form'.  
If type is 'json', `body` will be transformed with `JSON.stringify(body)`.  
If type is 'form' and `body` is object, `body` will be transformed to `FormData`.

#### HTTP method shortcut alias

```js
httpApi.get(url, query, options)
// json is the default body type
httpApi.post(url, body, { type: 'json' })
httpApi.put(url, body, { type: 'json' })
httpApi.patch(url, body, { type: 'json' })
httpApi.delete(url, query, options)
httpApi.options(url, query, options)
httpApi.head(url, query, options)
```

## License

[MIT](LICENSE)
