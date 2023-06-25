import { Test, TestingModule } from '@nestjs/testing';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { OrderDbHandlerService } from './order-db-handler.service';

describe('OrderDbHandlerService', () => {
  let service: OrderDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExternalDatabaseModule, CustomLoggerModule],
      providers: [OrderDbHandlerService],
    }).compile();

    service = module.get<OrderDbHandlerService>(OrderDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
