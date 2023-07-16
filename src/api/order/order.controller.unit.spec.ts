import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderAPIService } from './order.service';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderAPIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [OrderController],
      providers: [
        {
          provide: OrderAPIService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderAPIService>(OrderAPIService);
  });

  describe('existence and injection tests', () => {
    test('controller should be defined', () =>
      expect(controller).toBeDefined());
    test('OrderApiService should be injected into controller', () =>
      expect(orderService).toBeDefined());
  });
  describe('GET /', () => {});
  describe('GET /by-name/:name', () => {});
  describe('GET /:id', () => {});
  describe('DELETE /', () => {});
  describe('PATCH /statuses', () => {});
  describe('GET /lead-from-order/:name', () => {});
  afterEach(() => jest.restoreAllMocks());
});
