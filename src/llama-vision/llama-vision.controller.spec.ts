import { Test, TestingModule } from '@nestjs/testing';
import { LlamaVisionController } from './llama-vision.controller';
import { LlamaVisionService } from './llama-vision.service';

describe('LlamaVisionController', () => {
  let controller: LlamaVisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlamaVisionController],
      providers: [LlamaVisionService],
    }).compile();

    controller = module.get<LlamaVisionController>(LlamaVisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
