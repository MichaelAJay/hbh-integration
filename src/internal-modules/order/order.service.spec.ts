import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { CrmModule } from '../external-interface-handlers/crm/crm.module';
import { InternalDatabaseModule } from '../external-interface-handlers/database/database.module';
import { EzmanageApiHandlerModule } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.module';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        InternalDatabaseModule,
        EzmanageApiHandlerModule,
        CrmModule,
        CustomLoggerModule,
      ],
      providers: [OrderService],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
