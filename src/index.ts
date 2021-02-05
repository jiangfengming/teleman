import compose from 'koa-compose';

type PrimitiveType = string | number | boolean | null | undefined;

declare type SerializableData = string | number | boolean | null | undefined | SerializableData[] |
    { [name: string]: SerializableData };

type ReqOptions = {
  method?: Method | MethodLowercase,
  base?: string,
  headers?: Headers | Record<string, string>,
  query?: URLSearchParams | string | Record<string, PrimitiveType> | [string, PrimitiveType][],
  params?: Record<string, string | number | boolean>,
  body?: ReqBody | SerializableData,
  parseResponseBody?: boolean,
  throwFailedResponse?: boolean,
  use?: Middleware[],
  useBefore?: Middleware[],
  useAfter?: Middleware[],
  [name: string]: unknown
};

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'PURGE';
type MethodLowercase = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'purge';

type ReqBody = string | FormData | URLSearchParams | Blob | BufferSource | ReadableStream;

type MiddlewareCtx = {
  url: URL,

  options: {
    method: Method,
    headers: Headers,
    body: ReqBody
  },

  parseResponseBody: boolean,
  response?: Response,
  [name: string]: unknown
};

type Middleware = (ctx: MiddlewareCtx, next: () => Promise<unknown>) => Promise<unknown>;

type Query = string | Record<string, PrimitiveType> | [string, PrimitiveType][];

function createURLSearchParams(query: Query) {
  if (query.constructor === String) {
    return new URLSearchParams(query);
  }

  if (query.constructor === Object) {
    query = Object.entries(query);
  }

  const q = new URLSearchParams();

  for (const [name, value] of query as [string, PrimitiveType][]) {
    if (value !== null && value !== undefined) {
      q.append(name, value as string);
    }
  }

  return q;
}

type FormBody = Record<string, PrimitiveType | Blob> | [string, PrimitiveType | Blob, string?][];

function createFormData(data: FormBody) {
  if (data.constructor === Object) {
    data = Object.entries(data);
  }

  const f = new FormData();

  for (const [name, value, filename] of data as [string, PrimitiveType | Blob, string?][]) {
    if (value !== null && value !== undefined) {
      f.append(name, value as string, filename);
    }
  }

  return f;
}

class Teleman {
  base?: string

  headers?: Headers | Record<string, string>

  parseResponseBody: boolean

  throwFailedResponse: boolean

  middleware: Middleware[] = []

  constructor({
    base,
    headers,
    parseResponseBody = true,
    throwFailedResponse = true
  }: {
    base?: string,
    headers?: Headers | Record<string, string>,
    parseResponseBody?: boolean,
    throwFailedResponse?: boolean
  } = {}) {
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
    this.parseResponseBody = parseResponseBody;
    this.throwFailedResponse = throwFailedResponse;
  }

  use(middleware: Middleware, beginning = false): void {
    if (beginning) {
      this.middleware.unshift(middleware);
    } else {
      this.middleware.push(middleware);
    }
  }

  fetch(path: string, {
    method = 'GET',
    base = this.base,
    headers,
    query,
    params = {},
    body,
    parseResponseBody = this.parseResponseBody,
    throwFailedResponse = this.throwFailedResponse,
    use = this.middleware,
    useBefore = [],
    useAfter = [],
    ...rest
  }: ReqOptions = {}): Promise<unknown> {
    return new Promise(resolve => {
      method = method.toUpperCase() as Method;
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
      } else {
        headers = new Headers(this.headers || headers || {});
      }

      if (body !== undefined && body !== null && !['GET', 'HEAD'].includes(method)) {
        const contentType = headers.get('Content-Type') || '';

        if ((!contentType && body && body.constructor === Object) || contentType.startsWith('application/json')) {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
          }

          body = JSON.stringify(body);
        } else if (contentType.startsWith('multipart/form-data') && body && !(body instanceof FormData)) {
          body = createFormData(body as FormBody);
        } else if (contentType.startsWith('application/x-www-form-urlencoded') && body && !(body instanceof URLSearchParams)) {
          body = createURLSearchParams(body as Query);
        }
      }

      const ctx: MiddlewareCtx = {
        url,

        options: {
          method,
          headers,
          body: body as ReqBody
        },

        parseResponseBody,
        ...rest
      };

      resolve(compose([...useBefore, ...use, ...useAfter])(ctx, () =>
        fetch(ctx.url.href, ctx.options).then(response => {
          ctx.response = response;

          let body: Promise<unknown> = Promise.resolve();

          if (parseResponseBody && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'PURGE'].includes(ctx.options.method.toUpperCase())) {
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
            return body;
          } else {
            return body.then(e => {
              throw e;
            });
          }
        })
      ));
    });
  }

  get(path: string, query: Query, options: Omit<ReqOptions, 'method' | 'query'>): Promise<unknown> {
    return this.fetch(path, {
      ...options,
      method: 'GET',
      query
    });
  }

  post(path: string, body: ReqBody, options: Omit<ReqOptions, 'method' | 'body'>): Promise<unknown> {
    return this.fetch(path, {
      ...options,
      method: 'POST',
      body
    });
  }

  put(path: string, body: ReqBody, options: Omit<ReqOptions, 'method' | 'body'>): Promise<unknown> {
    return this.fetch(path, {
      ...options,
      method: 'PUT',
      body
    });
  }

  patch(path: string, body: ReqBody, options: Omit<ReqOptions, 'method' | 'body'>): Promise<unknown> {
    return this.fetch(path, {
      ...options,
      method: 'PATCH',
      body
    });
  }

  delete(path: string, query: Query, options: Omit<ReqOptions, 'method' | 'query'>): Promise<unknown> {
    return this.fetch(path, {
      ...options,
      method: 'DELETE',
      query
    });
  }

  head(path: string, query: Query, options: Omit<ReqOptions, 'method' | 'query'>): Promise<unknown> {
    return this.fetch(path, {
      ...options,
      method: 'HEAD',
      query
    });
  }

  purge(path: string, query: Query, options: Omit<ReqOptions, 'method' | 'query'>): Promise<unknown> {
    return this.fetch(path, {
      ...options,
      method: 'PURGE',
      query
    });
  }
}

export default Teleman;
export { Teleman };
export const teleman = new Teleman();
