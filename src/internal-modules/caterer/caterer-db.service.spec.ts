import { Test, TestingModule } from '@nestjs/testing';
import { CatererDbService } from './caterer-db.service';

describe('CatererDbService', () => {
  let service: CatererDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatererDbService],
    }).compile();

    service = module.get<CatererDbService>(CatererDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
