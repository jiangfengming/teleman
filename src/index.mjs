import compose from 'koa-compose'

function createURLSearchParams(query) {
  if (query.constructor === String) {
    return new URLSearchParams(query)
  }

  if (query.constructor === Object) {
    query = Object.entries(query)
  }

  const q = new URLSearchParams()

  for (const [name, value] of query) {
    if (value != null) q.append(name, value)
  }

  return q
}

function createFormData(data) {
  if (data.constructor === Object) {
    data = Object.entries(data)
  }

  const f = new FormData()

  for (const [name, value, filename] of data) {
    if (value != null) f.append(name, value, filename)
  }

  return f
}

class Teleman {
  constructor({ urlPrefix, headers, readBody = true } = {}) {
    this.urlPrefix = urlPrefix
    this.headers = headers
    this.readBody = readBody
    this.middleware = []
  }

  use(middleware) {
    this.middleware.push(middleware)
  }

  fetch(url, {
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
  ) {
    return new Promise(resolve => {
      method = method.toUpperCase()

      url = url.replace(/:([a-z]\w*)/ig, (_, w) => encodeURIComponent(params[w]))

      const absURL = /^https?:\/\//
      if (!absURL.test(url)) {
        if (urlPrefix) url = urlPrefix + url

        // urlPrefix also isn't absolute
        if (!absURL.test(url)) {
          try {
            const a = document.createElement('a')
            a.href = url
            url = a.href
          } catch (e) {
            // node.js env
          }
        }
      }

      url = new URL(url)

      if (query) {
        if (!(query instanceof URLSearchParams)) {
          query = createURLSearchParams(query)
        }

        for (const [name, value] of query.entries()) {
          url.searchParams.append(name, value)
        }
      }

      if (this.headers && headers) {
        const h = new Headers(this.headers)
        for (const [name, value] of new Headers(headers).entries()) {
          h.set(name, value)
        }
        headers = h
      } else {
        headers = new Headers(this.headers || headers || {})
      }

      if (body !== undefined && !['GET', 'HEAD'].includes(method)) {
        const contentType = headers.get('Content-Type') || ''

        if ((!contentType && body && body.constructor === Object) || contentType.startsWith('application/json')) {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
          }

          body = JSON.stringify(body)
        } else if (contentType.startsWith('multipart/form-data') && body && !(body instanceof FormData)) {
          body = createFormData(body)
        } else if (contentType.startsWith('application/x-www-form-urlencoded') && body && !(body instanceof URLSearchParams)) {
          body = createURLSearchParams(body)
        }
      }

      const ctx = {
        url,
        options: { method, headers, body },
        readBody,
        ...rest
      }

      resolve(compose([...useBefore, ...use, ...useAfter])(ctx, () =>
        fetch(ctx.url.href, ctx.options).then(response => {
          ctx.response = response

          let body = Promise.resolve()

          if (readBody && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(ctx.options.method.toUpperCase())) {
            const responseType = response.headers.get('Content-Type')

            if (responseType) {
              if (responseType.startsWith('application/json')) {
                body = response.json()
              } else if (responseType.startsWith('text/')) {
                body = response.text()
              } else if (responseType.startsWith('multipart/form-data')) {
                body = response.formData()
              }
            }
          }

          if (response.ok) {
            return body
          } else {
            return body.then(e => { throw e })
          }
        })
      ))
    })
  }

  get(url, query, options) {
    return this.fetch(url, {
      method: 'GET',
      query,
      ...options
    })
  }

  post(url, body, options) {
    return this.fetch(url, {
      method: 'POST',
      body,
      ...options
    })
  }

  put(url, body, options) {
    return this.fetch(url, {
      method: 'PUT',
      body,
      ...options
    })
  }

  patch(url, body, options) {
    return this.fetch(url, {
      method: 'PATCH',
      body,
      ...options
    })
  }

  delete(url, query, options) {
    return this.fetch(url, {
      method: 'DELETE',
      query,
      ...options
    })
  }

  head(url, query, options) {
    return this.fetch(url, {
      method: 'HEAD',
      query,
      ...options
    })
  }
}

const instance = Teleman.default = new Teleman()
Teleman.use = instance.use.bind(instance)
Teleman.fetch = instance.fetch.bind(instance)
Teleman.get = instance.get.bind(instance)
Teleman.post = instance.post.bind(instance)
Teleman.put = instance.put.bind(instance)
Teleman.patch = instance.patch.bind(instance)
Teleman.delete = instance.delete.bind(instance)
Teleman.head = instance.head.bind(instance)

export default Teleman
