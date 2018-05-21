
const { URL, URLSearchParams } = require('url')
const FormData = require('form-data')
const fetch = require('node-fetch')
const Headers = fetch.Headers

class HttpApi {
  constructor({ base = '', fetchOptions = {}, beforeFetch, responseHandler } = {}) {
    this.base = base;
    this.fetchOptions = fetchOptions;
    this.beforeFetch = beforeFetch;
    this.responseHandler = responseHandler;
  }

  fetch(url, { method = 'GET', headers, query, body, type } = {}) {
    url = this.base + url;

    if (query) {
      url = new URL(url);
      if (!(query instanceof URLSearchParams)) {
        // filter null/undefined
        if (query.constructor === Object) {
          query = Object.entries(query);
        }

        if (query instanceof Array) {
          query = query.filter(([, value]) => value != null);
        }

        query = new URLSearchParams(query);
      }

      for (const [name, value] of query.entries()) {
        url.searchParams.append(name, value);
      }

      url = url.toString();
    }

    if (this.fetchOptions.headers && headers) {
      const h = new Headers(this.fetchOptions.headers);
      for (const [name, value] of new Headers(headers).entries()) {
        h.set(name, value);
      }
      headers = h;
    } else if (this.fetchOptions.headers) {
      headers = new Headers(this.fetchOptions.headers);
    } else {
      headers = new Headers();
    }

    if (type === 'json') {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      body = JSON.stringify(body);
    } else if (type === 'form') {
      if (!(body instanceof FormData)) {
        const form = new FormData();

        for (const k in body) {
          form.append(k, body[k]);
        }

        body = form;
      }
    }

    let options = this.fetchOptions ? { ...this.fetchOptions, method, headers, body } : { method, headers, body };

    if (this.beforeFetch) {
      const modified = this.beforeFetch(url, options);
      if (modified && modified.url && modified.options) {
        ({ url, options } = modified);
      }
    }

    return fetch(url, options).then(res => {
      if (!res.ok) throw res

      let data;
      const contentType = res.headers.get('Content-Type');
      if (contentType && contentType.includes('json')) {
        data = res.json();
      }

      if (this.responseHandler) {
        data = data ? data.then(d => this.responseHandler(res, d)) : Promise.resolve(this.responseHandler(res));
      }

      return data || res
    })
  }

  get(url, query, options) {
    return this.fetch(url, {
      method: 'GET',
      query,
      ...options
    })
  }

  post(url, body, { type = 'json', ...options } = {}) {
    return this.fetch(url, {
      method: 'POST',
      body,
      type,
      ...options
    })
  }

  put(url, body, { type = 'json', ...options } = {}) {
    return this.fetch(url, {
      method: 'PUT',
      body,
      type,
      ...options
    })
  }

  patch(url, body, { type = 'json', ...options } = {}) {
    return this.fetch(url, {
      method: 'PATCH',
      body,
      type,
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
      method: 'options',
      query,
      ...options
    })
  }
}

module.exports = HttpApi;
