/**
 * Expose compositor.
 */

var koaCompose = compose;

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1;
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}

function createURLSearchParams(query) {
    if (query.constructor === String) {
        return new URLSearchParams(query);
    }
    if (query.constructor === Object) {
        query = Object.entries(query);
    }
    const q = new URLSearchParams();
    for (const [name, value] of query) {
        if (value !== null && value !== undefined) {
            q.append(name, value);
        }
    }
    return q;
}
function createFormData(data) {
    if (data.constructor === Object) {
        data = Object.entries(data);
    }
    const f = new FormData();
    for (const [name, value, filename] of data) {
        if (value !== null && value !== undefined) {
            f.append(name, value, filename);
        }
    }
    return f;
}
class Teleman {
    constructor({ base, headers, parseResponseBody = true, throwFailedResponse = true } = {}) {
        this.middleware = [];
        if (base) {
            this.base = base;
        }
        else {
            try {
                // defaults to document.baseURI in browser
                this.base = document.baseURI;
            }
            catch (e) {
                // in node.js, ignore
            }
        }
        this.headers = headers;
        this.parseResponseBody = parseResponseBody;
        this.throwFailedResponse = throwFailedResponse;
    }
    use(middleware, beginning = false) {
        if (beginning) {
            this.middleware.unshift(middleware);
        }
        else {
            this.middleware.push(middleware);
        }
    }
    fetch(path, { method = 'GET', base = this.base, headers, query, params = {}, body, parseResponseBody = this.parseResponseBody, throwFailedResponse = this.throwFailedResponse, use = this.middleware, useBefore = [], useAfter = [], ...rest } = {}) {
        return new Promise(resolve => {
            method = method.toUpperCase();
            const url = new URL(path.replace(/:([a-z]\w*)/ig, (_, w) => encodeURIComponent(params[w])), base);
            if (query) {
                if (!(query instanceof URLSearchParams)) {
                    query = createURLSearchParams(query);
                }
                query.forEach((value, name) => url.searchParams.append(name, value));
            }
            if (this.headers && headers) {
                const h = new Headers(this.headers);
                new Headers(headers).forEach((value, name) => h.set(name, value));
                headers = h;
            }
            else {
                headers = new Headers(this.headers || headers || {});
            }
            if (body !== undefined && body !== null && !['GET', 'HEAD'].includes(method)) {
                const contentType = headers.get('Content-Type') || '';
                if ((!contentType && body && body.constructor === Object) || contentType.startsWith('application/json')) {
                    if (!headers.has('Content-Type')) {
                        headers.set('Content-Type', 'application/json');
                    }
                    body = JSON.stringify(body);
                }
                else if (contentType.startsWith('multipart/form-data') && body && !(body instanceof FormData)) {
                    body = createFormData(body);
                }
                else if (contentType.startsWith('application/x-www-form-urlencoded') && body && !(body instanceof URLSearchParams)) {
                    body = createURLSearchParams(body);
                }
            }
            const ctx = {
                url,
                options: {
                    method,
                    headers,
                    body: body
                },
                parseResponseBody,
                ...rest
            };
            resolve(koaCompose([...useBefore, ...use, ...useAfter])(ctx, () => fetch(ctx.url.href, ctx.options).then(response => {
                ctx.response = response;
                let body = Promise.resolve();
                if (parseResponseBody && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'PURGE'].includes(ctx.options.method.toUpperCase())) {
                    const responseType = response.headers.get('Content-Type');
                    if (responseType) {
                        if (responseType.startsWith('application/json')) {
                            body = response.json();
                        }
                        else if (responseType.startsWith('text/')) {
                            body = response.text();
                        }
                        else if (responseType.startsWith('multipart/form-data')) {
                            body = response.formData();
                        }
                    }
                }
                if (response.ok || !throwFailedResponse) {
                    return body;
                }
                else {
                    return body.then(e => {
                        throw e;
                    });
                }
            })));
        });
    }
    get(path, query, options) {
        return this.fetch(path, {
            ...options,
            method: 'GET',
            query
        });
    }
    post(path, body, options) {
        return this.fetch(path, {
            ...options,
            method: 'POST',
            body
        });
    }
    put(path, body, options) {
        return this.fetch(path, {
            ...options,
            method: 'PUT',
            body
        });
    }
    patch(path, body, options) {
        return this.fetch(path, {
            ...options,
            method: 'PATCH',
            body
        });
    }
    delete(path, query, options) {
        return this.fetch(path, {
            ...options,
            method: 'DELETE',
            query
        });
    }
    head(path, query, options) {
        return this.fetch(path, {
            ...options,
            method: 'HEAD',
            query
        });
    }
    purge(path, query, options) {
        return this.fetch(path, {
            ...options,
            method: 'PURGE',
            query
        });
    }
}
const teleman = new Teleman();

export default Teleman;
export { Teleman, teleman };
//# sourceMappingURL=index.js.map
