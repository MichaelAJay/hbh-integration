import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderInternalInterfaceService } from './order-internal-interface.service';
import { OrderAPIModule } from './order.module';

describe('OrderInternalInterfaceService', () => {
  let service: OrderInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), OrderAPIModule],
    }).compile();

    service = module.get<OrderInternalInterfaceService>(
      OrderInternalInterfaceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
