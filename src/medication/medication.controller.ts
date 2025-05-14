import { BadRequestException, Body, Controller, InternalServerErrorException, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicationAnalysisService } from './medication.service';
import multer, { diskStorage } from 'multer';
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
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp|bmp|tiff)$/i)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
)
async uploadAndAnalyze(
  @UploadedFile() file: Express.Multer.File,
  @Body('prompt') prompt: string,
) {
  if (!file) {
    throw new BadRequestException('No image file uploaded');
  }

  const effectivePrompt = prompt?.trim() || this.medicationService.defaultPrompt;

  try {
    // Convert buffer to data URL
    const base64Image = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Image}`;
    
    const result = await this.medicationService.analyzeMedicationImage(dataUrl, effectivePrompt);
    return { result };
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new InternalServerErrorException(`Failed to analyze image: ${error.message}`);
  }
}
}