import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as crypto from 'crypto'; 
import multer from 'multer';
import { TtsMiddleware } from './medication/tts.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(new TtsMiddleware().use);

  // Configure Multer for multipart/form-data
  /*app.use(multer({
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: multer.memoryStorage(),
  }).any());
*/
  console.log(crypto.randomUUID());

  // Configurer Swagger
  const config = new DocumentBuilder()
    .setTitle('Medi-Trust API')
    .setDescription('API pour détecter les fausses informations médicales')
    .setVersion('1.0')
    .addTag('detection')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('NestJS application running on http://localhost:3000');
}
bootstrap();