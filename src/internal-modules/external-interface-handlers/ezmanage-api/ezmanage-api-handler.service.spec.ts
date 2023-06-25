import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EzmanageApiHandlerModule } from './ezmanage-api-handler.module';
import { EzmanageApiHandlerService } from './ezmanage-api-handler.service';

describe('EzmanageApiHandlerService', () => {
  let service: EzmanageApiHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), EzmanageApiHandlerModule],
    }).compile();

    service = module.get<EzmanageApiHandlerService>(EzmanageApiHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
