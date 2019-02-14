import compose from 'koa-compose'

function jsonifyable(val) {
  return val === null || [Object, Array, String, Number, Boolean].includes(val.constructor) || !!val.toJSON
}

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
  constructor({ urlPrefix, headers, responseType } = {}) {
    this.urlPrefix = urlPrefix
    this.headers = headers
    this.responseType = responseType
    this.middlewares = []
    this.runMiddlewares = compose(this.middlewares)
  }

  use(middleware) {
    this.middlewares.push(middleware)
    this.runMiddlewares = compose(this.middlewares)
  }

  fetch(url, {
    method = 'GET',
    urlPrefix = this.urlPrefix,
    headers,
    query,
    body,
    responseType = this.responseType,
    ...rest } = {}
  ) {
    return new Promise(resolve => {
      const originalParams = { url, method, urlPrefix, headers, query, body, responseType, ...rest }

      if (urlPrefix) url = urlPrefix + url

      method = method.toUpperCase()

      if (query) {
        url = new URL(url)

        if (!(query instanceof URLSearchParams)) {
          query = createURLSearchParams(query)
        }

        for (const [name, value] of query.entries()) {
          url.searchParams.append(name, value)
        }

        url = url.href
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

        if ((!contentType && jsonifyable(body)) || contentType.startsWith('application/json')) {
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
        originalParams,
        responseType,

        req: {
          url,
          options: { method, headers, body }
        }
      }

      resolve(this.runMiddlewares(ctx, () => {
        const request = ctx.request = new Request(ctx.req.url, ctx.req.options)

        return fetch(request).then(response => {
          ctx.response = response

          let body

          if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
            responseType = ctx.responseType || response.headers.get('Content-Type')

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

          ctx.body = body

          if (response.ok) {
            return body
          } else {
            throw body
          }
        })
      }))
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

export default Teleman
