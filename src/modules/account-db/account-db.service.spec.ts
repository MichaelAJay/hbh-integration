import { Test, TestingModule } from '@nestjs/testing';
import { AccountDbService } from './account-db.service';

describe('AccountDbService', () => {
  let service: AccountDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountDbService],
    }).compile();

    service = module.get<AccountDbService>(AccountDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
