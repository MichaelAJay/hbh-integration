import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { OrderDbHandlerService } from './order-db-handler.service';
import { OrderDbHandlerHelperService } from './order.db-handler.helper.service';

describe('OrderDbHandlerService', () => {
  let service: OrderDbHandlerService;
  let orderDbHandlerHelperService: OrderDbHandlerHelperService;
  let dbClientService: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDbHandlerService,
        {
          provide: OrderDbHandlerHelperService,
          useValue: {
            findMany: jest.fn(),
            findManyIntersection: jest.fn(),
            convertOrderRecordWithIdToOrderModelWithId: jest.fn(),
          },
        },
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

    service = module.get<OrderDbHandlerService>(OrderDbHandlerService);
    orderDbHandlerHelperService = module.get<OrderDbHandlerHelperService>(
      OrderDbHandlerHelperService,
    );
    dbClientService = module.get<DatabaseClientService>(DatabaseClientService);
  });

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('order db helper service is defined', () =>
      expect(orderDbHandlerHelperService).toBeDefined());
    test('dbClientService is defined', () =>
      expect(dbClientService).toBeDefined());
  });

  describe('create', () => {
    it('calls dbClientService.getDocRef with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getDocRef', async () => {});
    it('calls dbClientService.getDocRef a second time with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getDocRef the second time it is called', async () => {});
    it('calls dbClientService.set with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.set', async () => {});
  });
  describe('getOne', () => {
    it('calls dbClientService.getOne with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getOne', async () => {});
    it('returns null if order is not found', async () => {});
    it('throws UnprocessableEntityException if record returned from dbClientService.getOne does not pass isIorderRecord validation', async () => {});
    it('propagates any error thrown by isIOrderRecord validator', async () => {});
    it('returns an object adhering to the IOrderModelWithId interface', async () => {});
  });
  describe('getManyForAccount', () => {
    it('calls service findMany with the correct arguments', async () => {});
    it('propagates any error thrown by service findMany', async () => {});
    it('returns the response from service findMany on success', async () => {});
  });
  describe('getAllForAccount', () => {
    it('calls dbClientService.getDocRef with the correct arguments', async () => {});
    it('propagates any error thrown by dbclientService.getDocRef', async () => {});
    it('calls service findMany with the correct arguments', async () => {});
    it('propagates any error thrown by service findMany', async () => {});
    it('returns the result of service findMany on success', async () => {});
  });
  describe('findByNameForAccount', () => {
    it('calls dbClientService.getDocRef with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getDocRef', async () => {});
    it('calls service findManyIntersection with the correct arguments', async () => {});
    it('propagates any error thrown by findManyIntersection', async () => {});
    it('throws NotFoundException if no records are returned', async () => {});
    it('returns the first record from the returned results array on success', async () => {});
  });
  describe('updateOne', () => {
    it('calls dbClientService.update with the correct arguments, including and excluding properties as expected', async () => {});
    it('propagates any error thrown by dbClientService.update', async () => {});
    it('returns an object with updated: true on success', async () => {});
  });
  describe('delete', () => {
    it('calls dbClientService.delete with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.delete', async () => {});
    it('returns an object with didDelete: boolean on success', async () => {});
  });

  afterEach(() => jest.resetAllMocks());
});
