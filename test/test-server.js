const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

router.get('/text', ctx => {
  ctx.body = 'Hello World!'
})

app.use(router)

app.listen(300)
