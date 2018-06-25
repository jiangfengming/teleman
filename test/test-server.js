const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
app.use(bodyParser())

const router = new Router()

router.get('/', ctx => {
  ctx.body = 'Hello World!'
})

router.all('/headers', ctx => {
  ctx.body = {
    url: ctx.url,
    method: ctx.method,
    headers: ctx.headers
  }
})

router.get('/bin', ctx => {
  ctx.body = Buffer.from('Hello World!')
})

router.post('/echo', ctx => {
  ctx.body = ctx.request.body
})

router.get('/err.bin', ctx => {
  ctx.status = 500
  ctx.body = Buffer.from('not found')
})

app.use(cors())
app.use(router.routes())

app.listen(3000, () => {
  console.log('The server is listening on port 3000') // eslint-disable-line no-console
})
