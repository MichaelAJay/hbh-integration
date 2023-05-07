import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from './database-client.service';

describe('DatabaseClientService', () => {
  let service: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseClientService],
    }).compile();

    service = module.get<DatabaseClientService>(DatabaseClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
