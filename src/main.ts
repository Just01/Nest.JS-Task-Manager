import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Logger')

  const app = await NestFactory.create(AppModule)
  const port = 3000
  await app.listen(port)

  logger.debug(`Application listening on port ${port}`)
}

bootstrap()
