import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DetectionService {
  private readonly pythonServerUrl = 'http://127.0.0.1:5001/analyze';

  async verifyMedicalFact(statement: string) {
    try {
      const response = await axios.post(this.pythonServerUrl, { statement });
      return response.data;
    } catch (error) {
      console.error('Error during verification:', error);
      throw new HttpException('Erreur lors de la vérification', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}