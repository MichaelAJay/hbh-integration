import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { IAuthenticatedRequest } from '../interfaces';
import { DeleteOrdersBodyDto } from './dtos/body';
import { UiOrderStatus } from './enums/output';
import { IUpdateStatus } from './interfaces';
import { IGetOrderOutput } from './interfaces/output';
import { OrderController } from './order.controller';
import { OrderAPIService } from './order.service';
import { GetOrdersByAccount } from './types/output';

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
          useValue: {
            getOrdersByAccount: jest.fn(),
            getOrderByName: jest.fn(),
            getOrder: jest.fn(),
            deleteOrders: jest.fn(),
            updateStatuses: jest.fn(),
            generateLeadFromOrder: jest.fn(),
          },
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
  describe('GET /', () => {
    it('calls orderService.getOrdersByAccount with the correct arguments', async () => {
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
      } as IAuthenticatedRequest;
      const mockResolvedValue: GetOrdersByAccount = [
        {
          id: 'MOCK ORDER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          caterer: 'MOCK CATERER STRING',
        },
      ];
      const target = jest
        .spyOn(orderService, 'getOrdersByAccount')
        .mockResolvedValue(mockResolvedValue);

      await controller.getOrdersByAccount(mockReq);
      expect(target).toHaveBeenCalledWith({
        accountId: mockReq.accountId,
      });
    });
    it('returns the result of orderService.getOrdersByAccount on success', async () => {
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
      } as IAuthenticatedRequest;
      const mockResolvedValue: GetOrdersByAccount = [
        {
          id: 'MOCK ORDER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          caterer: 'MOCK CATERER STRING',
        },
      ];
      jest
        .spyOn(orderService, 'getOrdersByAccount')
        .mockResolvedValue(mockResolvedValue);

      const result = await controller.getOrdersByAccount(mockReq);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderService.getOrdersByAccount', async () => {
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
      } as IAuthenticatedRequest;
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderService, 'getOrdersByAccount')
        .mockRejectedValue(mockError);

      await expect(controller.getOrdersByAccount(mockReq)).rejects.toThrow(
        mockError,
      );
    });
  });
  describe('GET /by-name/:name', () => {
    it('calls orderService.getOrderByName with the correct arguments', async () => {
      const mockArguments: {
        name: string;
        req: { accountId: string; ref: ACCOUNT_REF };
      } = {
        name: 'MOCK ORDER NAME',
        req: {
          accountId: 'MOCK ACCOUNT ID',
          ref: 'H4H',
        },
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
        .spyOn(orderService, 'getOrderByName')
        .mockResolvedValue(mockResolvedValue);
      await controller.getOrderByName(
        mockArguments.name,
        mockArguments.req as IAuthenticatedRequest,
      );
      expect(target).toHaveBeenCalledWith({
        orderName: mockArguments.name,
        accountId: mockArguments.req.accountId,
        ref: mockArguments.req.ref,
      });
    });
    it('returns the result of orderService.getOrderByName on success', async () => {
      const mockArguments: {
        name: string;
        req: { accountId: string; ref: ACCOUNT_REF };
      } = {
        name: 'MOCK ORDER NAME',
        req: {
          accountId: 'MOCK ACCOUNT ID',
          ref: 'H4H',
        },
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
        .spyOn(orderService, 'getOrderByName')
        .mockResolvedValue(mockResolvedValue);
      const result = await controller.getOrderByName(
        mockArguments.name,
        mockArguments.req as IAuthenticatedRequest,
      );
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error throw by orderService.getOrderByName', async () => {
      const mockArguments: {
        name: string;
        req: { accountId: string; ref: ACCOUNT_REF };
      } = {
        name: 'MOCK ORDER NAME',
        req: {
          accountId: 'MOCK ACCOUNT ID',
          ref: 'H4H',
        },
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(orderService, 'getOrderByName').mockRejectedValue(mockError);
      await expect(
        controller.getOrderByName(
          mockArguments.name,
          mockArguments.req as IAuthenticatedRequest,
        ),
      ).rejects.toThrow(mockError);
    });
  });
  describe('GET /:id', () => {
    it('calls orderService.getOrder with the correct arguments', async () => {
      const mockArguments: {
        id: string;
        req: { accountId: string; ref: ACCOUNT_REF };
      } = {
        id: 'MOCK ORDER ID',
        req: {
          accountId: 'MOCK ACCOUNT ID',
          ref: 'H4H',
        },
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
        .spyOn(orderService, 'getOrder')
        .mockResolvedValue(mockResolvedValue);
      await controller.getOrder(
        mockArguments.id,
        mockArguments.req as IAuthenticatedRequest,
      );
      expect(target).toHaveBeenCalledWith({
        orderId: mockArguments.id,
        accountId: mockArguments.req.accountId,
        ref: mockArguments.req.ref,
      });
    });
    it('returns the result from orderService.getOrder on success', async () => {
      const mockArguments: {
        id: string;
        req: { accountId: string; ref: ACCOUNT_REF };
      } = {
        id: 'MOCK ORDER ID',
        req: {
          accountId: 'MOCK ACCOUNT ID',
          ref: 'H4H',
        },
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
      jest.spyOn(orderService, 'getOrder').mockResolvedValue(mockResolvedValue);
      const result = await controller.getOrder(
        mockArguments.id,
        mockArguments.req as IAuthenticatedRequest,
      );
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderService.getOrder', async () => {
      const mockArguments: {
        id: string;
        req: { accountId: string; ref: ACCOUNT_REF };
      } = {
        id: 'MOCK ORDER ID',
        req: {
          accountId: 'MOCK ACCOUNT ID',
          ref: 'H4H',
        },
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(orderService, 'getOrder').mockRejectedValue(mockError);
      await expect(
        controller.getOrder(
          mockArguments.id,
          mockArguments.req as IAuthenticatedRequest,
        ),
      ).rejects.toThrow(mockError);
    });
  });
  describe('DELETE /', () => {
    it('calls orderService.deleteOrders with the correct arguments', async () => {
      const mockBody: DeleteOrdersBodyDto = {
        ids: ['MOCK ID TO DELETE'],
      };
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;

      const mockResolvedValue = {
        deleted: [] as string[],
        didNotDelete: [] as string[],
        deleteErrors: [] as string[],
        invalid: [] as string[],
      };
      const target = jest
        .spyOn(orderService, 'deleteOrders')
        .mockResolvedValue(mockResolvedValue);
      await controller.deleteOrders(mockBody, mockReq);
      expect(target).toHaveBeenCalledWith({
        orderIds: mockBody.ids,
        accountId: mockReq.accountId,
        ref: mockReq.ref,
      });
    });
    it('returns the result from orderService.deleteOrders on success', async () => {
      const mockBody: DeleteOrdersBodyDto = {
        ids: ['MOCK ID TO DELETE'],
      };
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;

      const mockResolvedValue = {
        deleted: [] as string[],
        didNotDelete: [] as string[],
        deleteErrors: [] as string[],
        invalid: [] as string[],
      };
      jest
        .spyOn(orderService, 'deleteOrders')
        .mockResolvedValue(mockResolvedValue);
      const result = await controller.deleteOrders(mockBody, mockReq);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderService.deleteOrders', async () => {
      const mockBody: DeleteOrdersBodyDto = {
        ids: ['MOCK ID TO DELETE'],
      };
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;

      const mockEror = new Error('ERROR UNDER TEST');
      jest.spyOn(orderService, 'deleteOrders').mockRejectedValue(mockEror);
      await expect(controller.deleteOrders(mockBody, mockReq)).rejects.toThrow(
        mockEror,
      );
    });
  });
  describe('PATCH /statuses', () => {
    it('calls orderService.updateStatuses with the correct arguments', async () => {
      const mockOrderToUpdate = {
        id: 'MOCK ORDER ID',
        status: DbOrderStatus.ARCHIVED,
      };
      const mockBody: IUpdateStatus[] = [mockOrderToUpdate];
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;
      const mockResolvedValue = [
        { orderId: mockOrderToUpdate.id, didUpdate: true },
      ];
      const target = jest
        .spyOn(orderService, 'updateStatuses')
        .mockResolvedValue(mockResolvedValue);
      await controller.updateOrdersStatuses(mockBody, mockReq);
      expect(target).toHaveBeenCalledWith({
        updates: mockBody,
        accountId: mockReq.accountId,
        ref: mockReq.ref,
      });
    });
    it('returns the result of orderService.updateStatuses on success', async () => {
      const mockOrderToUpdate = {
        id: 'MOCK ORDER ID',
        status: DbOrderStatus.ARCHIVED,
      };
      const mockBody: IUpdateStatus[] = [mockOrderToUpdate];
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;
      const mockResolvedValue = [
        { orderId: mockOrderToUpdate.id, didUpdate: true },
      ];
      jest
        .spyOn(orderService, 'updateStatuses')
        .mockResolvedValue(mockResolvedValue);
      const result = await controller.updateOrdersStatuses(mockBody, mockReq);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by orderService.updateStatuses', async () => {
      const mockOrderToUpdate = {
        id: 'MOCK ORDER ID',
        status: DbOrderStatus.ARCHIVED,
      };
      const mockBody: IUpdateStatus[] = [mockOrderToUpdate];
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;
      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(orderService, 'updateStatuses').mockRejectedValue(mockError);
      await expect(
        controller.updateOrdersStatuses(mockBody, mockReq),
      ).rejects.toThrow(mockError);
    });
  });
  describe('GET /lead-from-order/:name', () => {
    it('calls orderService.generateLeadFromOrder with the correct arguments', async () => {
      const mockName = 'MOCK ORDER NAME';
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;
      const mockResolvedValue = undefined;
      const target = jest
        .spyOn(orderService, 'generateLeadFromOrder')
        .mockResolvedValue(mockResolvedValue);
      await controller.generateLeadFromOrder(mockName, mockReq);
      expect(target).toHaveBeenCalledWith({
        orderName: mockName,
        accountId: mockReq.accountId,
        ref: mockReq.ref,
      });
    });
    it('returns the result of orderService.generateLeadFromOrder on success', async () => {
      const mockName = 'MOCK ORDER NAME';
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;
      const mockResolvedValue = undefined;
      jest
        .spyOn(orderService, 'generateLeadFromOrder')
        .mockResolvedValue(mockResolvedValue);
      const result = await controller.generateLeadFromOrder(mockName, mockReq);
      expect(result).toBe(mockResolvedValue);
    });
    it('propagatse any error thrown by orderService.generateLeadFromOrder', async () => {
      const mockName = 'MOCK ORDER NAME';
      const mockReq = {
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H',
      } as IAuthenticatedRequest;
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderService, 'generateLeadFromOrder')
        .mockRejectedValue(mockError);
      await expect(
        controller.generateLeadFromOrder(mockName, mockReq),
      ).rejects.toThrow(mockError);
    });
  });
  afterEach(() => jest.restoreAllMocks());
});
