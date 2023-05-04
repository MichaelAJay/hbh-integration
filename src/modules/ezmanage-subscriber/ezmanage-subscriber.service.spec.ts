import { Test, TestingModule } from '@nestjs/testing';
import { EzmanageSubscriberService } from './ezmanage-subscriber.service';

describe('EzmanageSubscriberService', () => {
  let service: EzmanageSubscriberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EzmanageSubscriberService],
    }).compile();

    service = module.get<EzmanageSubscriberService>(EzmanageSubscriberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
