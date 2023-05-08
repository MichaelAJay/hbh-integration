import { Test, TestingModule } from '@nestjs/testing';
import { OrderDbService } from './order-db.service';

describe('OrderDbService', () => {
  let service: OrderDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderDbService],
    }).compile();

    service = module.get<OrderDbService>(OrderDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
