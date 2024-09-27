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

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('dbClientService is defined', () =>
      expect(dbClientService).toBeDefined());
  });
  describe('getOne', () => {
    it('calls dbClientService.getOne with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getOne', async () => {});
    it('throws UnprocessableEntityException if dbClientService.getOne returns null', async () => {});
    it('throws UnprocessableEntityException if dbClientService.getOne returns a record which fails isIUserRecordWithId validation', async () => {});
    it('returns a user object which adheres to the IUserModelWithId interface on success', async () => {});
    it('throws UnprocessableEntityException if created user object does not pass isIUserModelWithId validation', async () => {});
  });
  describe('getOneByEmail', () => {
    it('calls dbClientService.getMany with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getMany', async () => {});
    it('throws NotFoundException if no record found', async () => {});
    it('throws UnprocessableEntityException if returned record does not pass isIUserRecordWithId validation', async () => {});
    it('returns record that adheres to IUserModelWithId interface on success', async () => {});
  });
  describe('createOne', () => {
    it('calls dbClientService.getDocRef with the correct arguments', async () => {});
    it('propagastes any error thrown by dbClientService.getDocRef', async () => {});
    it('calls dbClientService.add with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.add', async () => {});
    it('returns the result of dbClientService.add on success', async () => {});
  });
  describe('updateOne', () => {
    it('calls dbClientService.update with the correct arguments', async () => {});
    it('propagates any error thrown by dbclientService.update', async () => {});
    it('returns the result of dbClientService.update on success', async () => {});
  });

  afterEach(() => jest.resetAllMocks());
});
