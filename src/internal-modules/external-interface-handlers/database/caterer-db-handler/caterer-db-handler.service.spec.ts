import { Test, TestingModule } from '@nestjs/testing';
import { CatererDbHandlerService } from './caterer-db-handler.service';

describe('CatererDbHandlerService', () => {
  let service: CatererDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatererDbHandlerService],
    }).compile();

    service = module.get<CatererDbHandlerService>(CatererDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
