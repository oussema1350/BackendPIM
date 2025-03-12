import { Controller, Post, Body } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';
import { CreateAnalyzeDto } from './dto/create-analyze.dto';

@Controller('analyze')
export class AnalyzeController {
    constructor(private readonly analyzeService: AnalyzeService) {}

    @Post()
    async analyze(@Body() createAnalyzeDto: CreateAnalyzeDto): Promise<{ response: string }> {
        const response = await this.analyzeService.analyzeText(createAnalyzeDto.prompt);
        return { response };
    }
}