import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlamaVisionService {
  private readonly logger = new Logger(LlamaVisionService.name);
  private readonly API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct';
  private readonly HF_TOKEN: string;

  constructor(private configService: ConfigService) {
    this.HF_TOKEN = this.configService.get<string>('HUGGING_FACE_TOKEN');
    
    if (!this.HF_TOKEN) {
      this.logger.warn('HUGGING_FACE_TOKEN not set in environment variables. API calls will be rate limited or may fail.');
    } else {
      this.logger.log('LlamaVisionService initialized with Hugging Face token');
    }
  }

  async analyzeImageBuffer(imageBuffer: Buffer, prompt: string): Promise<any> {
    try {
      this.logger.log(`Processing image analysis with prompt: ${prompt.substring(0, 50)}...`);
      
      const formData = new FormData();
      
      // Ajouter l'image au formulaire depuis un buffer
      formData.append('image', imageBuffer, { filename: 'image.jpg' });
      
      // Ajouter le prompt pour guider l'analyse
      const fullPrompt = `You are a medical assistant that can analyze medical images. ${prompt}`;
      formData.append('prompt', fullPrompt);

      // Configuration pour l'API Hugging Face
      const headers = {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${this.HF_TOKEN}`,
      };

      // Faire la requête à l'API Hugging Face
      this.logger.log('Sending request to Hugging Face API...');
      const response = await axios.post(this.API_URL, formData, { headers });
      
      this.logger.log('Received response from Hugging Face API');
      return response.data;
    } catch (error) {
      this.logger.error(`Error analyzing image: ${error.message}`);
      
      // Informations de débogage supplémentaires
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  }

  async analyzeImageUrl(imageUrl: string, prompt: string): Promise<any> {
    try {
      this.logger.log(`Processing image analysis from URL: ${imageUrl} with prompt: ${prompt.substring(0, 50)}...`);
      
      // Télécharger l'image depuis l'URL
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');
      
      // Utiliser la méthode existante pour analyser le buffer d'image
      return this.analyzeImageBuffer(imageBuffer, prompt);
    } catch (error) {
      this.logger.error(`Error analyzing image from URL: ${error.message}`);
      throw error;
    }
  }
}