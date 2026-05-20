
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap(){
  const app = await NestFactory.create(AppModule, { cors: true })
  const config = new DocumentBuilder().setTitle('NASIJ Admin API').setDescription('Admin endpoints').setVersion('2.0').build()
  const doc = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/swagger', app, doc)
  await app.listen(8088)
  console.log('NASIJ Admin API :8088')
}
bootstrap()
