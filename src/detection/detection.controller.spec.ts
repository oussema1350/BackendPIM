import { Test, TestingModule } from '@nestjs/testing';
import { DetectionController } from './detection.controller';
import { DetectionService } from './detection.service';

describe('DetectionController', () => {
  let controller: DetectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetectionController],
      providers: [DetectionService],
    }).compile();

    controller = module.get<DetectionController>(DetectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
