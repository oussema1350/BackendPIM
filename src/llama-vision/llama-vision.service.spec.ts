import { Test, TestingModule } from '@nestjs/testing';
import { LlamaVisionService } from './llama-vision.service';

describe('LlamaVisionService', () => {
  let service: LlamaVisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlamaVisionService],
    }).compile();

    service = module.get<LlamaVisionService>(LlamaVisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
