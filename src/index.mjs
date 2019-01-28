import compose from 'koa-compose'
class Teleman {
  constructor({ urlPrefix, headers } = {}) {
    this.urlPrefix = urlPrefix
    this.headers = headers
    this.middlewares = []
    this.runMiddlewares = compose(this.middlewares)
  }

  use(middleware) {
    this.middlewares.push(middleware)
    this.runMiddlewares = compose(this.middlewares)
  }

  fetch(url, { method = 'GET', urlPrefix = this.urlPrefix, headers, query, body, responseType } = {}) {
    return new Promise(resolve => {
      const originParams = { url, method, urlPrefix, headers, query, body, responseType }

      if (urlPrefix) url = urlPrefix + url

      method = method.toUpperCase()

      if (query) {
        url = new URL(url)

        if (!(query instanceof URLSearchParams)) {
          // filter null/undefined
          if (query.constructor === Object) {
            query = Object.entries(query)
          }

          if (query instanceof Array) {
            const q = new URLSearchParams()
            query.forEach(([name, value]) => {
              if (value != null) q.append(name, value)
            })
            query = q
          } else if (query.constructor === String) {
            query = new URLSearchParams(query)
          }
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

      if (body !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
        const contentType = headers.get('Content-Type') || ''

        if (!contentType || contentType.startsWith('application/json')) {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
          }

          body = JSON.stringify(body)
        } else if (contentType.startsWith('multipart/form-data') && !(body instanceof FormData)) {
          const form = new FormData()

          for (const k in body) {
            form.append(k, body[k])
          }

          body = form
        }
      }

      const ctx = {
        originParams,
        req: {
          url,
          options: { method, headers, body }
        }
      }

      resolve(this.runMiddlewares(ctx, () => {
        ctx.request = new Request(ctx.req.url, ctx.req.options)
        return fetch(ctx.request).then(response => {
          ctx.response = response

          let body

          if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            if (!responseType) responseType = response.headers.get('Content-Type')
            if (responseType) {
              if (responseType.startsWith('application/json')) {
                body = response.json()
              } else if (responseType.startsWith('text/')) {
                body = response.text()
              }
            }
          }

          // if complete handler is given, you should check response.ok yourself in the handler
          if (this.complete) {
            return body
              ? body.then(body => this.complete({ request, response, body }))
              : this.complete({ request, response, body })
          } else if (response.ok) {
            return body || response
          } else {
            throw body || response
          }
        }, error => {
          if (this.error) this.error({ request, error })
          else throw error
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
