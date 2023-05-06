import compose from "koa-compose";

export type PrimitiveType = string | number | boolean | null | undefined;

export type SerializableData =
  | string
  | number
  | boolean
  | null
  | undefined
  | SerializableData[]
  | { [name: string]: SerializableData };

export type ReqOptions = {
  method?: Method | MethodLowercase;
  base?: string;
  headers?: Headers | Record<string, string>;
  query?:
    | URLSearchParams
    | string
    | Record<string, PrimitiveType>
    | [string, PrimitiveType][];
  params?: Record<string, string | number | boolean>;
  body?: ReqBody | SerializableData;
  use?: Middleware[];
  [index: string]: unknown;
};

export type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "PURGE";
export type MethodLowercase =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "purge";
export type ReqBody =
  | string
  | FormData
  | URLSearchParams
  | Blob
  | BufferSource
  | ReadableStream;

export type MiddlewareCtx = {
  url: URL;

  options: {
    method: Method;
    headers: Headers;
    body: ReqBody;
  };

  response?: Response;
  [name: string]: unknown;
};

export type Middleware = (
  ctx: MiddlewareCtx,
  next: () => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => unknown;
export type Query =
  | string
  | Record<string, PrimitiveType>
  | [string, PrimitiveType][];
export type FormBody =
  | Record<string, PrimitiveType | Blob>
  | [string, PrimitiveType | Blob, string?][];

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

function createFormData(data: FormBody) {
  if (data.constructor === Object) {
    data = Object.entries(data);
  }

  const f = new FormData();

  for (const [name, value, filename] of data as [
    string,
    PrimitiveType | Blob,
    string?
  ][]) {
    if (value !== null && value !== undefined) {
      if (filename) {
        f.append(name, value as Blob, filename);
      } else {
        f.append(name, value as string);
      }
    }
  }

  return f;
}

class Teleman {
  base?: string;
  headers: Headers;
  middleware: Middleware[] = [];

  constructor({
    base,
    headers,
  }: {
    base?: string;
    headers?: Headers | Record<string, string>;
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

    this.headers = new Headers(headers);
  }

  use(middleware: Middleware) {
    this.middleware.push(middleware);
    return this;
  }

  async fetch<T>(
    path: string,
    {
      method = "GET",
      base = this.base,
      headers,
      query,
      params = {},
      body,
      use = this.middleware,
      ...rest
    }: ReqOptions = {}
  ): Promise<T> {
    method = method.toUpperCase() as Method;
    const url = new URL(
      path.replace(/:([a-z]\w*)/gi, (_, w) => encodeURIComponent(params[w])),
      base
    );

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
      headers = new Headers(this.headers || headers);
    }

    if (
      body !== undefined &&
      body !== null &&
      !["GET", "HEAD"].includes(method)
    ) {
      const contentType = headers.get("content-type") || "";

      if (
        (!contentType && body && body.constructor === Object) ||
        contentType.startsWith("application/json")
      ) {
        if (!headers.has("content-type")) {
          headers.set("content-type", "application/json");
        }

        body = JSON.stringify(body);
      } else if (
        contentType.startsWith("multipart/form-data") &&
        body &&
        !(body instanceof FormData)
      ) {
        body = createFormData(body as FormBody);
      } else if (
        contentType.startsWith("application/x-www-form-urlencoded") &&
        body &&
        !(body instanceof URLSearchParams)
      ) {
        body = createURLSearchParams(body as Query);
      }
    }

    const ctx: MiddlewareCtx = {
      url,

      options: {
        method,
        headers,
        body: body as ReqBody,
      },

      ...rest,
    };

    return <Promise<T>>compose(use)(ctx, () =>
      fetch(ctx.url.href, ctx.options).then((response) => {
        ctx.response = response;
        let body: Promise<unknown> = Promise.resolve(response);

        if (!["HEAD", "head"].includes(ctx.options.method)) {
          const responseType = response.headers.get("content-type");

          if (responseType) {
            if (responseType.startsWith("application/json")) {
              body = response.json();
            } else if (responseType.startsWith("text/")) {
              body = response.text();
            }
          }
        }

        if (response.ok) {
          return body;
        } else {
          return body.then((e) => {
            throw e;
          });
        }
      })
    );
  }

  get<T>(path: string, query?: Query, options?: ReqOptions) {
    return this.fetch<T>(path, {
      ...options,
      method: "GET",
      query,
    });
  }

  post<T>(
    path: string,
    body?: ReqBody | SerializableData,
    options?: ReqOptions
  ) {
    return this.fetch<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  }

  put<T>(
    path: string,
    body?: ReqBody | SerializableData,
    options?: ReqOptions
  ) {
    return this.fetch<T>(path, {
      ...options,
      method: "PUT",
      body,
    });
  }

  patch<T>(
    path: string,
    body?: ReqBody | SerializableData,
    options?: ReqOptions
  ) {
    return this.fetch<T>(path, {
      ...options,
      method: "PATCH",
      body,
    });
  }

  delete<T>(path: string, query?: Query, options?: ReqOptions) {
    return this.fetch<T>(path, {
      ...options,
      method: "DELETE",
      query,
    });
  }

  head<T>(path: string, query?: Query, options?: ReqOptions) {
    return this.fetch<T>(path, {
      ...options,
      method: "HEAD",
      query,
    });
  }

  purge<T>(path: string, query?: Query, options?: ReqOptions) {
    return this.fetch<T>(path, {
      ...options,
      method: "PURGE",
      query,
    });
  }
}

export default Teleman;
export { Teleman };
export const teleman = new Teleman();
