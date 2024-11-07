import Koa from 'koa'
import http from 'http'
import routers from './routes'
import koaBody from 'koa-body'
import { appLogger } from './utils/Logger'
import { getPool, initDb } from './database'
import { Contact } from './models/Contact'

initDb({
  "host": "127.0.0.1",
  "user": "backend",
  "database": "backend",
  "password": "123",
})

Contact.pool = getPool()

const port = 5000
const koa = new Koa()
const server = http.createServer({}, koa.callback())

koa.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Credentials', 'true')
  await next()
})
koa.use(koaBody({ multipart: true }))

for (const router of routers) {
  koa
    .use(router.routes())
    .use(router.allowedMethods())
}

server.on('error', (e) => { appLogger.error('Ошибка сервера', e) })
server.listen(port)
appLogger.info(`Сервер запущен и прослушивает запросы на порт ${port} `)
