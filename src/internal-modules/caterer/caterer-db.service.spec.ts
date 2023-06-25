import { Test, TestingModule } from '@nestjs/testing';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { CatererDbService } from './caterer-db.service';

describe('CatererDbService', () => {
  let service: CatererDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExternalDatabaseModule],
      providers: [CatererDbService],
    }).compile();

    service = module.get<CatererDbService>(CatererDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
