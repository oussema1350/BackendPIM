import { Module } from '@nestjs/common';
import { LlamaVisionController } from './llama-vision.controller';
import { LlamaVisionService } from './llama-vision.service';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule, // Pour accéder aux variables d'environnement
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  ],
  controllers: [LlamaVisionController],
  providers: [LlamaVisionService],
  exports: [LlamaVisionService], // Pour utiliser le service dans d'autres modules
})
export class LlamaVisionModule {}