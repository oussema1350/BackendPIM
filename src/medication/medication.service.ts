import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicationAnalysisService {
  private readonly apiKey = 'tgp_v1_pt02wt0zB4A5outkZ_qdUhtcTcpHnBd60p1qnSEEkX0'; // Store in environment variables
  private readonly apiUrl = 'https://api.together.xyz/v1/chat/completions';
  private readonly model = 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8';
  private readonly defaultPrompt = 'give me the medication name and how to use it in just two lines,if its not a medicament image just print you should choose a medicament image please';

  async analyzeMedicationImage(imageUrl: string, prompt?: string): Promise<any> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: this.defaultPrompt // Always use the default prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new HttpException(
        `Failed to analyze medication image: ${error.message}`,
        error.response?.status || 500
      );
    }
  }
}