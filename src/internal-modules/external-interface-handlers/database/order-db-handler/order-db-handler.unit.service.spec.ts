import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { OrderDbHandlerService } from './order-db-handler.service';

describe('OrderDbHandlerService', () => {
  let service: OrderDbHandlerService;
  let dbClientService: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDbHandlerService,
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
    dbClientService = module.get<DatabaseClientService>(DatabaseClientService);
  });

  describe('existence tests', () => {});

  describe('create', () => {});
  describe('getOne', () => {});
  describe('getManyForAccount', () => {});
  describe('getAllForAccount', () => {});
  describe('findByNameForAccount', () => {});
  describe('updateOne', () => {});
  describe('delete', () => {});

  afterEach(() => jest.resetAllMocks());
});
