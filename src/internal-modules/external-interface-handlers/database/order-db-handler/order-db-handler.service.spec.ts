import { Test, TestingModule } from '@nestjs/testing';
import { OrderDbHandlerService } from './order-db-handler.service';

describe('OrderDbHandlerService', () => {
  let service: OrderDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderDbHandlerService],
    }).compile();

    service = module.get<OrderDbHandlerService>(OrderDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
