import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { UserDbHandlerService } from './user-db-handler.service';

describe('UserDbHandlerService', () => {
  let service: UserDbHandlerService;
  let dbClientService: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDbHandlerService,
        {
          provide: DatabaseClientService,
          useValue: {
            getOne: jest.fn(),
            getMany: jest.fn(),
            getDocRef: jest.fn(),
            add: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserDbHandlerService>(UserDbHandlerService);
    dbClientService = module.get<DatabaseClientService>(DatabaseClientService);
  });

  describe('existence tests', () => {});
  describe('getOne', () => {});
  describe('getOneByEmail', () => {});
  describe('createOne', () => {});
  describe('updateOne', () => {});

  afterEach(() => jest.resetAllMocks());
});
