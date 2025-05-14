import { Test, TestingModule } from '@nestjs/testing';
import { MedicationUploadController } from './medication.controller';
import { MedicationAnalysisService } from './medication.service';

describe('MedicationUploadController', () => {
  let controller: MedicationUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicationUploadController], // Use the correct controller name
      providers: [MedicationAnalysisService], // Ensure the service is correctly provided
    }).compile();

    controller = module.get<MedicationUploadController>(MedicationUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});