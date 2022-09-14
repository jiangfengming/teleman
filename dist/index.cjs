'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var compose = require('koa-compose');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var compose__default = /*#__PURE__*/_interopDefaultLegacy(compose);

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
            if (filename) {
                f.append(name, value, filename);
            }
            else {
                f.append(name, value);
            }
        }
    }
    return f;
}
class Teleman {
    base;
    headers;
    middleware = [];
    constructor({ base, headers } = {}) {
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
        this.headers = new Headers(headers);
    }
    use(middleware) {
        this.middleware.push(middleware);
        return this;
    }
    async fetch(path, { method = 'GET', base = this.base, headers, query, params = {}, body, use = this.middleware, ...rest } = {}) {
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
            headers = new Headers(this.headers || headers);
        }
        if (body !== undefined && body !== null && !['GET', 'HEAD'].includes(method)) {
            const contentType = headers.get('content-type') || '';
            if (!contentType && body && body.constructor === Object || contentType.startsWith('application/json')) {
                if (!headers.has('content-type')) {
                    headers.set('content-type', 'application/json');
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
            ...rest
        };
        return compose__default["default"](use)(ctx, () => fetch(ctx.url.href, ctx.options).then(response => {
            ctx.response = response;
            let body = Promise.resolve(response);
            if (!['HEAD', 'head'].includes(ctx.options.method)) {
                const responseType = response.headers.get('content-type');
                if (responseType) {
                    if (responseType.startsWith('application/json')) {
                        body = response.json();
                    }
                    else if (responseType.startsWith('text/')) {
                        body = response.text();
                    }
                }
            }
            if (response.ok) {
                return body;
            }
            else {
                return body.then(e => {
                    throw e;
                });
            }
        }));
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

exports.Teleman = Teleman;
exports["default"] = Teleman;
exports.teleman = teleman;
//# sourceMappingURL=index.cjs.map
