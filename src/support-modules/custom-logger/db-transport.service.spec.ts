import { Test, TestingModule } from '@nestjs/testing';
import { DbTransportService } from './db-transport.service';

describe('DbTransportService', () => {
  let service: DbTransportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbTransportService],
    }).compile();

    service = module.get<DbTransportService>(DbTransportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
