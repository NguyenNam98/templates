import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express'
import * as morgan from 'morgan'
import { AllExceptionsFilter } from './all-exceptions.filter'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'
import * as process from 'process'
import { json, urlencoded } from 'express'

// const isLocal = process.env.ENV === 'develop';
const PORT = 7001

const server: express.Express = express()
async function createNestServer(serverExpress: express.Express) {
  const logger: any[] = ['error', 'warn', 'debug'].concat(
    process.env.ENV != 'production' ? ['log'] : [],
  )
  const adapter = new ExpressAdapter(serverExpress)
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    adapter,
    {
      cors: true,
      logger,
    },
  )
  // set env
  app.use(
    morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent" ',
      {
        skip: function (req) {
          return req.originalUrl.startsWith('/health') || req.method == 'GET'
        },
      },
    ),
  )
  app.use(json({ limit: '1mb' }))
  app.use(urlencoded({ extended: true, limit: '1mb' }))
  app.use(cookieParser())
  app.useGlobalFilters(new AllExceptionsFilter())

  // Health check path
  app.use('/health', (req, res) => {
    res.sendStatus(200)
  })

  await app.listen(PORT)
  console.log(`server listening at: http://host.docker.internal:${PORT}/`)

  return app
}

createNestServer(server)
