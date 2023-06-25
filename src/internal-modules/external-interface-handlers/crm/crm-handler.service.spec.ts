import { Test, TestingModule } from '@nestjs/testing';
import { CrmHandlerService } from './crm-handler.service';
import { CrmModule } from './crm.module';

describe('CrmHandlerService', () => {
  let service: CrmHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CrmModule],
      providers: [CrmHandlerService],
    }).compile();

    service = module.get<CrmHandlerService>(CrmHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
