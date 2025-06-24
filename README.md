# Teleman

**Teleman** is a minimalist wrapper around the native `fetch` API. It weighs ~2 kB (gzipped) yet adds everything you miss in vanilla `fetch`:

* A Koa-style middleware pipeline.
* Automatic serialisation of query strings, path parameters and request bodies.
* Automatic response decoding (`json()`, `text()`, or raw `Response`).
* Built-in error handling – non-`2xx` responses reject the promise.
* First-class TypeScript support.


## Installation

```sh
npm i teleman
```


## Quick start

```ts
import Teleman from "teleman";

const api = new Teleman({
  base: "https://api.example.com", // optional base URL
});

// GET /articles/123?draft=false
const article = await api.get("/articles/:id", {
  id: 123,
  draft: false,
});

// POST /articles  (Content-Type: application/json)
await api.post("/articles", {
  title: "Hello",
  content: "# Hello",
});

// POST /upload  (Content-Type: multipart/form-data)
await api.post("/upload", new FormData(document.forms[0]));
```

### Singleton helper
For tiny scripts you do not have to create an instance:

```ts
import { teleman } from "teleman";

const data = await teleman.get("https://example.com/data.json");
```


## Creating an instance

```ts
new Teleman(options?: {
  base?: string;               // Base URL – defaults to document.baseURI in browsers
  headers?: HeadersInit;       // Default headers for every request
});
```


## API reference

### `instance.fetch<T>(path, options?) : Promise<T>`
Complete control – all shortcut methods ultimately call `fetch()`.

```ts
interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "PURGE";
  base?: string;                      // Overrides instance.base for this call only
  headers?: HeadersInit;              // Extra headers (merged with instance headers)
  query?: URLSearchParams | string | Record<string, Primitive> | Array<[string, Primitive]>;
  params?: Record<string, string | number | boolean>; // URL path parameters
  body?: BodyInit | SerializableData; // Serialised automatically when necessary
  use?: Middleware[];                 // Extra middleware for *this* request
  // ...any additional fields you attach to the middleware context
}
```

`fetch()` returns a promise that resolves to:

* `response.json()` if the server replies with `Content-Type: application/json`.
* `response.text()` for any `text/*` response.
* The raw `Response` object otherwise.

The promise rejects when `response.ok === false` and resolves to the decoded **body** otherwise – you do **not** have to check the status code yourself.

#### Shortcut methods

```ts
instance.get<T>(path, query?, options?)
instance.post<T>(path, body?, options?)
instance.put<T>(path, body?, options?)
instance.patch<T>(path, body?, options?)
instance.delete<T>(path, query?, options?)
instance.head<T>(path, query?, options?)
instance.purge<T>(path, query?, options?)
```
All shortcut methods forward to `fetch()` with the corresponding HTTP verb.


## Middleware

Teleman borrows the elegant middleware pattern from Koa. A middleware is an async function receiving a context object and a `next()` callback:

```ts
import type { MiddlewareCtx, Middleware } from "teleman";

const logger: Middleware = async (ctx: MiddlewareCtx, next) => {
  const start = Date.now();
  const data = await next();               // wait for the request to finish
  const ms = Date.now() - start;
  console.info(`${ctx.options.method} ${ctx.url.href} – ${ms}ms`);
  return data;                             // you may also transform the data
};

api.use(logger);
```

`ctx` contains:

```ts
interface MiddlewareCtx {
  url: URL;               // fully resolved URL (after params & query)
  options: {
    method: string;
    headers: Headers;
    body: BodyInit | null;
  };
  response?: Response;    // attached after await next()
  // plus any custom fields you passed through options
}
```

Within middleware you may mutate `ctx.url` / `ctx.options` to influence the outgoing request **or** inspect & transform the decoded response.


## Utility helpers

The package exports two helpers that are also used internally. They can be handy when you need stand-alone conversions:

```ts
import { createURLSearchParams, createFormData } from "teleman";

const qs   = createURLSearchParams({ foo: 1, bar: "baz" });
const form = createFormData({ file: myBlob, name: "avatar.png" });
```


## Browser & Node support

Teleman uses modern Web APIs (`fetch`, `Headers`, `URL`). It runs in all evergreen browsers and Node ≥ 18. No transpilation is required, but you may transpile/ponyfill `fetch` to target legacy environments.


## License

[MIT](LICENSE)
