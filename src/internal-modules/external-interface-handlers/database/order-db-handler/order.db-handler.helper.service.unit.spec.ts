import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { OrderDbHandlerHelperService } from './order.db-handler.helper.service';

describe('OrderDbHandlerHelperService', () => {
  let service: OrderDbHandlerHelperService;
  let dbClientService: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDbHandlerHelperService,
        {
          provide: DatabaseClientService,
          useValue: {
            getDocRef: jest.fn(),
            set: jest.fn(),
            getOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getMany: jest.fn(),
            getManyIntersection: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderDbHandlerHelperService>(
      OrderDbHandlerHelperService,
    );
    dbClientService = module.get<DatabaseClientService>(DatabaseClientService);
  });

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('dbClientService is defined', () =>
      expect(dbClientService).toBeDefined());
  });

  describe('findMany', () => {
    it('calls dbClientService.getMany with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getMany', async () => {});
    it('throws NotFoundException if querySnapshot is empty', async () => {});
    it('returns array of converted records that pass isIOrderRecord validation on success', async () => {});
  });
  describe('findManyIntersection', () => {
    it('calls dbClientService.getMany with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getMany', async () => {});
    it('throws NotFoundException if querySnapshot is empty', async () => {});
    it('returns array of converted records that pass isIOrderRecord validation on success', async () => {});
  });
  describe('convertOrderRecordWithIdToOrderModelWithId', () => {
    it('returns object adhering to IOrderModelWithId interface on success', async () => {});
  });

  afterEach(() => jest.resetAllMocks());
});
