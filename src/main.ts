import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
}
bootstrap();