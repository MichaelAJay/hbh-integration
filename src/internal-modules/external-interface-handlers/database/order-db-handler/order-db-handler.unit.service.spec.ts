import { Test, TestingModule } from '@nestjs/testing';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { OrderDbHandlerService } from './order-db-handler.service';

describe('OrderDbHandlerService', () => {
  let service: OrderDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExternalDatabaseModule],
      providers: [OrderDbHandlerService],
    }).compile();

    service = module.get<OrderDbHandlerService>(OrderDbHandlerService);
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
