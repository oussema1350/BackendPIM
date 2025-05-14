import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MedicationUploadController } from './medication.controller';
import { MedicationAnalysisService } from './medication.service';
import { diskStorage } from 'multer';
import * as fs from 'fs/promises';

// Ensure uploads directory exists asynchronously
const uploadsDir = './uploads';
(async () => {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
})();

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
        },
      }),
    }),
  ],
  controllers: [MedicationUploadController],
  providers: [MedicationAnalysisService],
})
export class MedicationModule {}