import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

interface GenerateResponse {
    response: string;
}

@Injectable()
export class AnalyzeService {
    constructor(private readonly httpService: HttpService) {}

    async analyzeText(prompt: string): Promise<string> {
        if (!prompt?.trim()) {
            throw new HttpException('Prompt cannot be empty', 400);
        }
    
        // Prepend instruction to user prompt
        const instructedPrompt = 
            "You are a medical assistant. Only answer medical prompt with 'Yes' or 'No' and give a brief justification." +
            "prompt: " + prompt;
    
        try {
            const response = await firstValueFrom(
                this.httpService.post<GenerateResponse>(
                    'http://localhost:9000/generate', 
                    { prompt: instructedPrompt } // Changed from input_text to prompt
                )
            );
            
            if (!response.data?.response) {
                throw new HttpException('Invalid response from medical analysis service', 502);
            }
    
            return response.data.response;
        } catch (error) {
            if (error instanceof AxiosError) {
                const errorMessage = error.response?.data?.detail || 
                                   error.response?.data?.message || 
                                   error.message;
                throw new HttpException(
                    `Medical analysis failed: ${errorMessage}`,
                    error.response?.status || 500
                );
            }
            throw new HttpException(
                `Analysis error: ${error.message}`,
                500
            );
        }
    }
}