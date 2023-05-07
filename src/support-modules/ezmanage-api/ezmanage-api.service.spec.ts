import { Test, TestingModule } from '@nestjs/testing';
import { EzmanageApiService } from './ezmanage-api.service';

describe('EzmanageApiService', () => {
  let service: EzmanageApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EzmanageApiService],
    }).compile();

    service = module.get<EzmanageApiService>(EzmanageApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
