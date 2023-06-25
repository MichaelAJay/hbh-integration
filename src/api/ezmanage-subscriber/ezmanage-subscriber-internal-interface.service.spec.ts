import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountModule } from 'src/internal-modules/account/account.module';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { OrderModule } from 'src/internal-modules/order/order.module';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';

describe('EzmanageSubscriberInternalInterfaceService', () => {
  let service: EzmanageSubscriberInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        AccountModule,
        OrderModule,
        InternalDatabaseModule,
      ],
      providers: [EzmanageSubscriberInternalInterfaceService],
    }).compile();

    service = module.get<EzmanageSubscriberInternalInterfaceService>(
      EzmanageSubscriberInternalInterfaceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
