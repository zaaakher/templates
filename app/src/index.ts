import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

app.use('*', async (c, next) => {
  await next()
})

app.use('/templates/*', serveStatic({ 
  root: '../templates',
  rewriteRequestPath: (path) => {
    return path.replace('/templates/', '')
  }
}))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 4000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
