import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderInternalInterfaceService } from './order-internal-interface.service';
import { OrderAPIService } from './order.service';

describe('OrderService', () => {
  let service: OrderAPIService;
  let orderInternalInterface: OrderInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        OrderAPIService,
        {
          provide: OrderInternalInterfaceService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OrderAPIService>(OrderAPIService);
    orderInternalInterface = module.get<OrderInternalInterfaceService>(
      OrderInternalInterfaceService,
    );
  });

  describe('existence and injection tests', () => {
    test('service should be defined', () => expect(service).toBeDefined());
    test('OrderInternalInterfaceService is injected onto orderInternalInterface', () =>
      expect(orderInternalInterface).toBeDefined());
  });

  describe('getOrdersByAccount', () => {});
  describe('getOrder', () => {});
  describe('updateStatuses', () => {});
  describe('deleteOrders', () => {});
  describe('generateLeadFromOrder', () => {});

  afterEach(() => jest.restoreAllMocks());
});
