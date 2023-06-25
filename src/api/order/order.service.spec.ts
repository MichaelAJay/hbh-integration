import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAPIModule } from './order.module';
import { OrderAPIService } from './order.service';

describe('OrderService', () => {
  let service: OrderAPIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), OrderAPIModule],
    }).compile();

    service = module.get<OrderAPIService>(OrderAPIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
