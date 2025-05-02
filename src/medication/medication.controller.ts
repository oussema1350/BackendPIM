import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicationAnalysisService } from './medication.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Add this class for validation
class AnalyzeMedicationDto {
  imageUrl: string;
  prompt?: string;
}

@Controller('medications')
export class MedicationUploadController {
  constructor(private readonly medicationService: MedicationAnalysisService) {}

  // Add this new endpoint
  @Post('analyze')
  async analyzeImage(@Body() dto: AnalyzeMedicationDto) {
    return {
      result: await this.medicationService.analyzeMedicationImage(dto.imageUrl, dto.prompt)
    };
  }

  // Your existing upload endpoint
  @Post('upload-and-analyze')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename: string = uuidv4();
          const extension: string = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  async uploadAndAnalyze(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt: string,
  ) {
    // You'll need to implement image hosting or use a service like S3
    // This is just a placeholder for the image URL
    const imageUrl = `https://your-domain.com/uploads/${file.filename}`;
    
    return {
      result: await this.medicationService.analyzeMedicationImage(imageUrl, prompt)
    };
  }
}