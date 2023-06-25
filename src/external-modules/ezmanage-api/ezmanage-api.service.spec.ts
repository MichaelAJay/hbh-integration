import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ExternalEzmanageApiModule } from './ezmanage-api.module';
import { EzmanageApiService } from './ezmanage-api.service';

describe('EzmanageApiService', () => {
  let service: EzmanageApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), ExternalEzmanageApiModule],
      providers: [EzmanageApiService],
    }).compile();

    service = module.get<EzmanageApiService>(EzmanageApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
