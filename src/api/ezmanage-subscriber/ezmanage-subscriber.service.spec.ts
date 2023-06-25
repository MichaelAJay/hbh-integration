import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountModule } from 'src/internal-modules/account/account.module';
import { EzmanageSubscriberAPIModule } from './ezmanage-subscriber.module';
import { EzmanageSubscriberAPIService } from './ezmanage-subscriber.service';

describe('EzmanageSubscriberService', () => {
  let service: EzmanageSubscriberAPIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        AccountModule,
        EzmanageSubscriberAPIModule,
      ],
    }).compile();

    service = module.get<EzmanageSubscriberAPIService>(
      EzmanageSubscriberAPIService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
