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
  describe('getOne', () => {
    it('calls dbClientService.getOne with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getOne', async () => {});
    it('throws UnprocessableEntityException if dbClientService.getOne returns null', async () => {});
    it('throws UnprocessableEntityException if dbClientService.getOne returns a record which fails isIUserRecordWithId validation', async () => {});
    it('returns a user object which adheres to the IUserModelWithId interface on success', async () => {});
    it('throws UnprocessableEntityException if created user object does not pass isIUserModelWithId validation', async () => {});
  });
  describe('getOneByEmail', () => {});
  describe('createOne', () => {});
  describe('updateOne', () => {});

  afterEach(() => jest.resetAllMocks());
});
