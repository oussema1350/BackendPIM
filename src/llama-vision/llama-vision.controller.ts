import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException, Logger, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LlamaVisionService } from './llama-vision.service';

@Controller('vision')
export class LlamaVisionController {
  private readonly logger = new Logger(LlamaVisionController.name);

  constructor(private readonly llamaVisionService: LlamaVisionService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('image'))
  async analyzeImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt: string,
  ) {
    if (!file) {
      this.logger.error('No image file provided in request');
      throw new BadRequestException('Image file is required');
    }

    if (!prompt) {
      this.logger.error('No prompt provided in request');
      throw new BadRequestException('Prompt is required');
    }

    this.logger.log(`Received image analysis request with file: ${file.originalname}`);

    try {
      const result = await this.llamaVisionService.analyzeImageBuffer(
        file.buffer,
        prompt,
      );
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Failed to analyze image: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('analyze-url')
  async analyzeImageUrl(
    @Query('url') imageUrl: string,
    @Query('prompt') prompt: string,
  ) {
    if (!imageUrl) {
      this.logger.error('No image URL provided in request');
      throw new BadRequestException('Image URL is required');
    }

    if (!prompt) {
      this.logger.error('No prompt provided in request');
      throw new BadRequestException('Prompt is required');
    }

    this.logger.log(`Received image URL analysis request for: ${imageUrl}`);

    try {
      const result = await this.llamaVisionService.analyzeImageUrl(
        imageUrl,
        prompt,
      );
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Failed to analyze image from URL: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}