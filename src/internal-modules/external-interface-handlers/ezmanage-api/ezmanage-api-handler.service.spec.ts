import { Test, TestingModule } from '@nestjs/testing';
import { EzmanageApiHandlerService } from './ezmanage-api-handler.service';

describe('EzmanageApiHandlerService', () => {
  let service: EzmanageApiHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EzmanageApiHandlerService],
    }).compile();

    service = module.get<EzmanageApiHandlerService>(EzmanageApiHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
