import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as config from 'config'

async function bootstrap() {
  const logger = new Logger('Logger')
  const app = await NestFactory.create(AppModule)

  const serverConfig = config.get('server')

  const port = process.env.PORT || serverConfig.port
  await app.listen(port)
  logger.debug(`Application listening on port ${port}`)
}

bootstrap()
