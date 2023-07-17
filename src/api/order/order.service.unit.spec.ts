import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { UiOrderStatus } from './enums/output';
import { IGetOrderOutput } from './interfaces/output';
import { OrderInternalInterfaceService } from './order-internal-interface.service';
import { OrderAPIService } from './order.service';
import { GetOrdersByAccount } from './types/output';

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
          useValue: {
            getOrdersByAccount: jest.fn(),
            getOrder: jest.fn(),
            getOrderByName: jest.fn(),
            updateStatuses: jest.fn(),
            deleteOrders: jest.fn(),
            generateLeadFromOrder: jest.fn(),
          },
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
  describe('getOrdersByAccount', () => {
    it('calls orderInternalInterface.getOrdersByAccount with the correct arguments', async () => {
      const mockArguments = { accountId: 'MOCK ACCOUNT ID' };
      const mockResolvedValue: GetOrdersByAccount = [
        {
          id: 'MOCK ORDER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          caterer: 'MOCK CATERER STRING',
        },
      ];
      const target = jest
        .spyOn(orderInternalInterface, 'getOrdersByAccount')
        .mockResolvedValue(mockResolvedValue);

      await service.getOrdersByAccount(mockArguments);
      expect(target).toHaveBeenCalledWith({
        accountId: mockArguments.accountId,
      });
    });
    it('returns the result from orderInternalInterface.getOrdersByAccount on success', async () => {
      const mockArguments = { accountId: 'MOCK ACCOUNT ID' };
      const mockResolvedValue: GetOrdersByAccount = [
        {
          id: 'MOCK ORDER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          caterer: 'MOCK CATERER STRING',
        },
      ];
      jest
        .spyOn(orderInternalInterface, 'getOrdersByAccount')
        .mockResolvedValue(mockResolvedValue);

      const result = await service.getOrdersByAccount(mockArguments);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderInternalInterface.getOrdersByAccount', async () => {
      const mockArguments = { accountId: 'MOCK ACCOUNT ID' };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderInternalInterface, 'getOrdersByAccount')
        .mockRejectedValue(mockError);

      await expect(service.getOrdersByAccount(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
  });
  describe('getOrder', () => {
    it('calls orderInternalInterface.getOrder with the correct arguments', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue: IGetOrderOutput = {
        status: UiOrderStatus.ACCEPTED,
        orderNumber: 'MOCK ORDER NUMBER',
        catererName: 'MOCK CATERER NAME',
        event: {
          deliveryTime: new Date(),
          address: null,
          contact: null,
        },
        contact: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: 0,
          catererTotalDue: 0,
          tip: 0,
          deliveryFee: 0,
          commission: 0,
        },
        items: [],
        sourceType: 'MOCK SOURCE TYPE',
        itemsAggregate: {},
      };
      const target = jest
        .spyOn(orderInternalInterface, 'getOrder')
        .mockResolvedValue(mockResolvedValue);
      await service.getOrder(mockArguments);
      expect(target).toHaveBeenCalledWith(mockArguments);
    });
    it('returns the result from orderInternalInterface.getOrder on success', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue: IGetOrderOutput = {
        status: UiOrderStatus.ACCEPTED,
        orderNumber: 'MOCK ORDER NUMBER',
        catererName: 'MOCK CATERER NAME',
        event: {
          deliveryTime: new Date(),
          address: null,
          contact: null,
        },
        contact: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: 0,
          catererTotalDue: 0,
          tip: 0,
          deliveryFee: 0,
          commission: 0,
        },
        items: [],
        sourceType: 'MOCK SOURCE TYPE',
        itemsAggregate: {},
      };
      jest
        .spyOn(orderInternalInterface, 'getOrder')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.getOrder(mockArguments);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderInternalInterface.getOrder', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderInternalInterface, 'getOrder')
        .mockRejectedValue(mockError);

      await expect(service.getOrder(mockArguments)).rejects.toThrow(mockError);
    });
  });
  describe('getOrderByName', () => {
    it('calls orderInternalInterface.getOrderByName with the correct arguments', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue: IGetOrderOutput = {
        status: UiOrderStatus.ACCEPTED,
        orderNumber: '',
        catererName: '',
        event: {
          deliveryTime: new Date(),
          address: null,
          contact: null,
        },
        contact: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: 0,
          catererTotalDue: 0,
          tip: 0,
          deliveryFee: 0,
          commission: 0,
        },
        items: [],
        sourceType: '',
        itemsAggregate: {},
      };
      const target = jest
        .spyOn(orderInternalInterface, 'getOrderByName')
        .mockResolvedValue(mockResolvedValue);
      await service.getOrderByName(mockArguments);
      expect(target).toHaveBeenCalledWith({
        orderName: mockArguments.orderName
          .toUpperCase()
          .split('')
          .filter((char) => /[a-zA-Z0-9]/.test(char))
          .join(''),
        accountId: mockArguments.accountId,
        ref: mockArguments.ref,
      });
    });
    it('returns the result from orderInternalInterface.getOrderByName on success', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue: IGetOrderOutput = {
        status: UiOrderStatus.ACCEPTED,
        orderNumber: '',
        catererName: '',
        event: {
          deliveryTime: new Date(),
          address: null,
          contact: null,
        },
        contact: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: 0,
          catererTotalDue: 0,
          tip: 0,
          deliveryFee: 0,
          commission: 0,
        },
        items: [],
        sourceType: '',
        itemsAggregate: {},
      };
      jest
        .spyOn(orderInternalInterface, 'getOrderByName')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.getOrderByName(mockArguments);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderInternalInterface.getOrderByName', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderInternalInterface, 'getOrderByName')
        .mockRejectedValue(mockError);

      await expect(service.getOrderByName(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
  });
  describe('updateStatuses', () => {
    it('calls orderInternalInterface.updateStatuses with the correct arguments', async () => {
      const mockOrderToUpdate = {
        id: 'MOCK ORDER ID',
        status: DbOrderStatus.ARCHIVED,
      };
      const mockArguments = {
        updates: [mockOrderToUpdate],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue = [
        { orderId: mockOrderToUpdate.id, didUpdate: true },
      ];
      const target = jest
        .spyOn(orderInternalInterface, 'updateStatuses')
        .mockResolvedValue(mockResolvedValue);
      await service.updateStatuses(mockArguments);
      expect(target).toHaveBeenCalledWith(mockArguments);
    });
    it('returns the result from orderInternalInterface.updateStatuses on success', async () => {
      const mockOrderToUpdate = {
        id: 'MOCK ORDER ID',
        status: DbOrderStatus.ARCHIVED,
      };
      const mockArguments = {
        updates: [mockOrderToUpdate],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue = [
        { orderId: mockOrderToUpdate.id, didUpdate: true },
      ];
      jest
        .spyOn(orderInternalInterface, 'updateStatuses')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.updateStatuses(mockArguments);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderInternalInterface.updateStatuses', async () => {
      const mockOrderToUpdate = {
        id: 'MOCK ORDER ID',
        status: DbOrderStatus.ARCHIVED,
      };
      const mockArguments = {
        updates: [mockOrderToUpdate],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderInternalInterface, 'updateStatuses')
        .mockRejectedValue(mockError);

      await expect(service.updateStatuses(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
  });
  describe('deleteOrders', () => {
    it('calls orderInternalInterface.deleteOrders with the correct arguments', async () => {
      const mockArguments = {
        orderIds: ['MOCK ORDER ID'],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue = {
        invalidOrders: [] as string[],
      };
      const target = jest
        .spyOn(orderInternalInterface, 'deleteOrders')
        .mockResolvedValue(mockResolvedValue);
      await service.deleteOrders(mockArguments);
      expect(target).toHaveBeenCalledWith(mockArguments);
    });
    it('returns the result from orderInternalInterface.deleteOrders on success', async () => {
      const mockArguments = {
        orderIds: ['MOCK ORDER ID'],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue = {
        invalidOrders: [] as string[],
      };
      jest
        .spyOn(orderInternalInterface, 'deleteOrders')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.deleteOrders(mockArguments);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderInternalInterface.deleteOrders', async () => {
      const mockArguments = {
        orderIds: ['MOCK ORDER ID'],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderInternalInterface, 'deleteOrders')
        .mockRejectedValue(mockError);

      await expect(service.deleteOrders(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
  });
  describe('generateLeadFromOrder', () => {
    it('calls orderInternalInterface.generateLeadFromOrder with the correct arguments', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue = undefined;
      const target = jest
        .spyOn(orderInternalInterface, 'generateLeadFromOrder')
        .mockResolvedValue(mockResolvedValue);
      await service.generateLeadFromOrder(mockArguments);
      expect(target).toHaveBeenCalledWith(mockArguments);
    });
    it('returns the result from orderInternalInterface.generateLeadFromOrder on success', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockResolvedValue = undefined;
      jest
        .spyOn(orderInternalInterface, 'generateLeadFromOrder')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.generateLeadFromOrder(mockArguments);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderInternalInterface.generateLeadFromOrder', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderInternalInterface, 'generateLeadFromOrder')
        .mockRejectedValue(mockError);

      await expect(
        service.generateLeadFromOrder(mockArguments),
      ).rejects.toThrow(mockError);
    });
  });
  afterEach(() => jest.restoreAllMocks());
});
