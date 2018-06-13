const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')

const app = new Koa()
const router = new Router()

router.get('/', ctx => {
  ctx.body = 'Hello World!'
})

app.use(cors())
app.use(router.routes())

app.listen(3000, () => {
  console.log('The server is listening on port 3000') // eslint-disable-line no-console
})
