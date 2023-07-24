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

  describe('existence tests', () => {});
  describe('getOne', () => {});
  describe('getOneByEmail', () => {});
  describe('createOne', () => {});
  describe('updateOne', () => {});

  afterEach(() => jest.resetAllMocks());
});
