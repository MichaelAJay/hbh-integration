import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceflowService } from './invoiceflow.service';

describe('InvoiceflowService', () => {
  let service: InvoiceflowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceflowService],
    }).compile();

    service = module.get<InvoiceflowService>(InvoiceflowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
