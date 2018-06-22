class Teleman {
  constructor({ base = '', fetchOptions = {}, beforeFetch, complete, error } = {}) {
    this.base = base
    this.fetchOptions = fetchOptions || {}
    this.beforeFetch = beforeFetch
    this.complete = complete
    this.error = error
  }

  fetch(url, { method = 'GET', headers, query, body, type } = {}) {
    if (this.base) url = this.base + url
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

      url = url.toString()
    }

    if (this.fetchOptions.headers && headers) {
      const h = new Headers(this.fetchOptions.headers)
      for (const [name, value] of new Headers(headers).entries()) {
        h.set(name, value)
      }
      headers = h
    } else {
      headers = new Headers(this.fetchOptions.headers || headers || undefined)
    }

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (type === 'json' || !type && body && body.constructor === Object) {
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json')
        }

        body = JSON.stringify(body)
      } else if (type === 'form' && !(body instanceof FormData)) {
        const form = new FormData()

        for (const k in body) {
          form.append(k, body[k])
        }

        body = form
      }
    }

    let options = { ...this.fetchOptions, method, headers, body }

    if (this.beforeFetch) {
      const modified = this.beforeFetch(url, options)
      if (modified && modified.url && modified.options) {
        ({ url, options } = modified)
      }
    }

    const request = new Request(url, options)

    return fetch(request).then(response => {
      let body
      const contentType = response.headers.get('Content-Type')
      if (contentType) {
        if (contentType.startsWith('application/json')) {
          body = response.json()
        } else if (contentType.startsWith('text/')) {
          body = response.text()
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

  options(url, query, options) {
    return this.fetch(url, {
      method: 'OPTIONS',
      query,
      ...options
    })
  }
}

export default Teleman
