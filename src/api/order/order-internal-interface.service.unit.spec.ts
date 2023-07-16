import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import exp from 'constants';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { OrderInternalInterfaceService } from './order-internal-interface.service';
import { OrderAPIModule } from './order.module';

describe('OrderInternalInterfaceService', () => {
  let service: OrderInternalInterfaceService;
  let orderService: OrderService;
  let orderDbHandler: OrderDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        OrderInternalInterfaceService,
        {
          provide: OrderService,
          useValue: {},
        },
        {
          provide: OrderDbHandlerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OrderInternalInterfaceService>(
      OrderInternalInterfaceService,
    );
    orderService = module.get<OrderService>(OrderService);
    orderDbHandler = module.get<OrderDbHandlerService>(OrderDbHandlerService);
  });

  describe('existence & injection tests', () => {
    test('service should be defined', () => expect(service).toBeDefined());
    test('OrderService should be injected into service.orderService', () =>
      expect(orderService).toBeDefined());
    test('OrderDbHandlerService should be injected into service as service.orderDbHandler', () =>
      expect(orderDbHandler).toBeDefined());
  });
  describe('getOrdersByAccount', () => {});
  describe('getOrder', () => {});
  describe('getEzManageOrder', () => {});
  describe('getOrderByName', () => {});
  describe('updateStatuses', () => {});
  describe('deleteOrders', () => {});
  describe('generateLeadFromOrder', () => {});
  describe('getInternalOrderByName', () => {});
  afterEach(() => jest.restoreAllMocks());
});
