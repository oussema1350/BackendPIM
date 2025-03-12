import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyzeService {
    constructor(private readonly httpService: HttpService) {}

    async analyzeText(prompt: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:8000/generate', { prompt })
            );
            return response.data.response;
        } catch (error) {
            throw new Error(`Failed to analyze text: ${error.message}`);
        }
    }
}