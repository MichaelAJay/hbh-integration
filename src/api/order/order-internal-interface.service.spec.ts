import { Test, TestingModule } from '@nestjs/testing';
import { OrderInternalInterfaceService } from './order-internal-interface.service';

describe('OrderInternalInterfaceService', () => {
  let service: OrderInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderInternalInterfaceService],
    }).compile();

    service = module.get<OrderInternalInterfaceService>(
      OrderInternalInterfaceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
