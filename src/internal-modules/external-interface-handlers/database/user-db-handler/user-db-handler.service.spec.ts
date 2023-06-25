import { Test, TestingModule } from '@nestjs/testing';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { UserDbHandlerService } from './user-db-handler.service';

describe('UserDbHandlerService', () => {
  let service: UserDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExternalDatabaseModule],
      providers: [UserDbHandlerService],
    }).compile();

    service = module.get<UserDbHandlerService>(UserDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
