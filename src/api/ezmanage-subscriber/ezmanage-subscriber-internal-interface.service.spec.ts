import { Test, TestingModule } from '@nestjs/testing';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';

describe('EzmanageSubscriberInternalInterfaceService', () => {
  let service: EzmanageSubscriberInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EzmanageSubscriberInternalInterfaceService],
    }).compile();

    service = module.get<EzmanageSubscriberInternalInterfaceService>(EzmanageSubscriberInternalInterfaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
