import { expect, test } from "@jest/globals";
import { Teleman } from "../src";

const api = new Teleman({
  base: "http://localhost:3000",
});

const api2 = new Teleman({
  base: "http://localhost:3000",

  headers: {
    foo: "1",
    bar: "2",
  },
});

api2.use(async (ctx, next) => {
  try {
    return await next();
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    } else {
      throw {
        code: ctx.response?.status,
        message: e,
      };
    }
  }
});

test("should fetch with correct url", () =>
  api.fetch("/", {
    use: [(ctx) => expect(ctx.url.href).toBe("http://localhost:3000/")],
  }));

test("should read the response body if the response content-type is application/json", async () => {
  const res = <Record<string, unknown>>await api.fetch("/headers");
  expect(res.url).toBe("/headers");
});

test("query can be object", () =>
  api.fetch("/", {
    query: { a: 1, b: 2 },
    use: [(ctx) => expect(ctx.url.href).toBe("http://localhost:3000/?a=1&b=2")],
  }));

test("query can be string", () =>
  api.fetch("/", {
    query: "a=1&b=2",
    use: [(ctx) => expect(ctx.url.href).toBe("http://localhost:3000/?a=1&b=2")],
  }));

test("should convert body type of object to JSON by default", () =>
  api.post(
    "/",
    { a: 1, b: 2 },
    {
      use: [
        (ctx) => {
          expect(ctx.options.headers.get("content-type")).toBe(
            "application/json"
          );
          expect(ctx.options.body).toBe('{"a":1,"b":2}');
        },
      ],
    }
  ));

test("should convert body type of object to FormData if the request content-type is set to multipart/form-data", () =>
  api.post(
    "/",
    { a: 1, b: 2 },
    {
      headers: { "content-type": "multipart/form-data" },
      use: [(ctx) => expect(ctx.options.body).toBeInstanceOf(FormData)],
    }
  ));

test("should convert body type of object to URLSearchParams if the request content-type is set to application/x-www-form-urlencoded", () =>
  api.post(
    "/",
    { a: 1, b: 2 },
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      use: [(ctx) => expect(ctx.options.body).toBeInstanceOf(URLSearchParams)],
    }
  ));

test("should merge default headers with headers param", () =>
  api2.fetch("/", {
    headers: { foo: "11", baz: "3" },

    use: [
      (ctx) => {
        expect(ctx.options.headers.get("foo")).toBe("11");
        expect(ctx.options.headers.get("bar")).toBe("2");
        expect(ctx.options.headers.get("baz")).toBe("3");
      },
    ],
  }));

test("should throw response body if response.ok is false", async () =>
  await expect(api.get("/404")).rejects.toBe("Not Found"));

test("should throw error if fetch failed", async () =>
  await expect(api.get("http://127.0.0.1:65535/")).rejects.toThrow());

test("should run middleware", async () =>
  await expect(api2.get("/404")).rejects.toStrictEqual({
    code: 404,
    message: "Not Found",
  }));

test("should request with PUT method", () =>
  api.put("/", null, {
    use: [(ctx) => expect(ctx.options.method).toBe("PUT")],
  }));

test("should request with PATCH method", () =>
  api.patch("/", null, {
    use: [(ctx) => expect(ctx.options.method).toBe("PATCH")],
  }));

test("should request with DELETE method", () =>
  api.delete("/", undefined, {
    use: [(ctx) => expect(ctx.options.method).toBe("DELETE")],
  }));

test("should request with HEAD method", () =>
  api.head("/", undefined, {
    use: [(ctx) => expect(ctx.options.method).toBe("HEAD")],
  }));
