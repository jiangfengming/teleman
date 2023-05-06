import Koa from "koa";
import Router from "koa-pilot";

const app = new Koa();
const router = new Router();

router.head("/", (ctx) => {
  ctx.status = 200;
});

router.get("/", (ctx) => {
  ctx.body = "Hello World!";
});

router.get("/headers", (ctx) => {
  ctx.body = {
    url: ctx.url,
    method: ctx.method,
    headers: ctx.headers,
  };
});

app.use(router.middleware);

app.listen(3000, () => {
  console.log("The server is listening on port 3000"); // eslint-disable-line no-console
});
