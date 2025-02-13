import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DetectionService } from './detection.service';

@ApiTags('detection')
@Controller('detection')
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify medical fact' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  })
  async verifyMedicalFact(@Body('text') text: string) {
    return this.detectionService.verifyMedicalFact(text);
  }
}