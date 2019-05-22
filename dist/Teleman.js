'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var compose = _interopDefault(require('koa-compose'));

function createURLSearchParams(query) {
  if (query.constructor === String) {
    return new URLSearchParams(query)
  }

  if (query.constructor === Object) {
    query = Object.entries(query);
  }

  const q = new URLSearchParams();

  for (const [name, value] of query) {
    if (value != null) q.append(name, value);
  }

  return q
}

function createFormData(data) {
  if (data.constructor === Object) {
    data = Object.entries(data);
  }

  const f = new FormData();

  for (const [name, value, filename] of data) {
    if (value != null) f.append(name, value, filename);
  }

  return f
}

class Teleman {
  constructor({ base, headers, readBody = true, throwFailedResponse = true } = {}) {
    if (base) {
      this.base = base;
    } else {
      try {
        // defaults to document.baseURI in browser
        this.base = document.baseURI;
      } catch (e) {
        // in node.js, ignore
      }
    }

    this.headers = headers;
    this.readBody = readBody;
    this.throwFailedResponse = throwFailedResponse;
    this.middleware = [];
  }

  use(middleware, beginning = false) {
    if (beginning) {
      this.middleware.unshift(middleware);
    } else {
      this.middleware.push(middleware);
    }
  }

  fetch(url, {
    method = 'GET',
    base = this.base,
    headers,
    query,
    params = {},
    body,
    readBody = this.readBody,
    throwFailedResponse = this.throwFailedResponse,
    use = this.middleware,
    useBefore = [],
    useAfter = [],
    ...rest } = {}
  ) {
    return new Promise(resolve => {
      method = method.toUpperCase();
      url = new URL(url.replace(/:([a-z]\w*)/ig, (_, w) => encodeURIComponent(params[w])), base);

      if (query) {
        if (!(query instanceof URLSearchParams)) {
          query = createURLSearchParams(query);
        }

        for (const [name, value] of query.entries()) {
          url.searchParams.append(name, value);
        }
      }

      if (this.headers && headers) {
        const h = new Headers(this.headers);
        for (const [name, value] of new Headers(headers).entries()) {
          h.set(name, value);
        }
        headers = h;
      } else {
        headers = new Headers(this.headers || headers || {});
      }

      if (body !== undefined && !['GET', 'HEAD'].includes(method)) {
        const contentType = headers.get('Content-Type') || '';

        if ((!contentType && body && body.constructor === Object) || contentType.startsWith('application/json')) {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
          }

          body = JSON.stringify(body);
        } else if (contentType.startsWith('multipart/form-data') && body && !(body instanceof FormData)) {
          body = createFormData(body);
        } else if (contentType.startsWith('application/x-www-form-urlencoded') && body && !(body instanceof URLSearchParams)) {
          body = createURLSearchParams(body);
        }
      }

      const ctx = {
        url,
        options: { method, headers, body },
        readBody,
        ...rest
      };

      resolve(compose([...useBefore, ...use, ...useAfter])(ctx, () =>
        fetch(ctx.url.href, ctx.options).then(response => {
          ctx.response = response;

          let body = Promise.resolve();

          if (readBody && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(ctx.options.method.toUpperCase())) {
            const responseType = response.headers.get('Content-Type');

            if (responseType) {
              if (responseType.startsWith('application/json')) {
                body = response.json();
              } else if (responseType.startsWith('text/')) {
                body = response.text();
              } else if (responseType.startsWith('multipart/form-data')) {
                body = response.formData();
              }
            }
          }

          if (response.ok || !throwFailedResponse) {
            return body
          } else {
            return body.then(e => { throw e })
          }
        })
      ));
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

const singleton = Teleman.singleton = new Teleman();
Teleman.use = singleton.use.bind(singleton);
Teleman.fetch = singleton.fetch.bind(singleton);
Teleman.get = singleton.get.bind(singleton);
Teleman.post = singleton.post.bind(singleton);
Teleman.put = singleton.put.bind(singleton);
Teleman.patch = singleton.patch.bind(singleton);
Teleman.delete = singleton.delete.bind(singleton);
Teleman.head = singleton.head.bind(singleton);

module.exports = Teleman;
//# sourceMappingURL=Teleman.js.map
