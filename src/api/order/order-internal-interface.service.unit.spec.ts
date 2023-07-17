import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import { IOrderModelWithId } from 'src/external-modules/database/models';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { UiOrderStatus } from './enums/output';
import { IGetOrderOutput } from './interfaces/output';
import { OrderInternalInterfaceService } from './order-internal-interface.service';

jest.mock('./utility', () => ({
  ...jest.requireActual('./utility'),
  convertEzManageOrderForOutput: jest.fn(
    () => ({} as Omit<IGetOrderOutput, 'catererName'>),
  ),
}));
import * as orderUtils from './utility';

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
          useValue: {
            getAllForAccount: jest.fn(),
            getOne: jest.fn(),
          },
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
  describe('getOrdersByAccount', () => {
    it('calls orderDbHandler.getAllForAccount with the correct arguments', async () => {
      const mockArguments = { accountId: 'MOCK ACCOUNT ID' };
      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const target = jest
        .spyOn(orderDbHandler, 'getAllForAccount')
        .mockResolvedValue([mockOrder]);
      await service.getOrdersByAccount(mockArguments);
      expect(target).toHaveBeenCalledWith(mockArguments.accountId);
    });
    it('returns mapped array of orders from orderDbHandler.getAllForAccount', async () => {
      const mockArguments = { accountId: 'MOCK ACCOUNT ID' };
      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(orderDbHandler, 'getAllForAccount')
        .mockResolvedValue([mockOrder]);
      const result = await service.getOrdersByAccount(mockArguments);
      expect(result).toEqual([
        {
          id: mockOrder.id,
          name: mockOrder.name,
          status: mockOrder.status,
          caterer: mockOrder.catererName,
        },
      ]);
    });
    it('propagates any error thrown by orderDbHanderl.getAllForAccount', async () => {
      const mockArguments = { accountId: 'MOCK ACCOUNT ID' };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderDbHandler, 'getAllForAccount')
        .mockRejectedValue(mockError);
      await expect(service.getOrdersByAccount(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
  });
  describe('getOrder', () => {
    it('calls orderDbHandler.getOne with the correct arguments', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      /**
       * Note:  The resolved value is not important for this test
       */
      const target = jest
        .spyOn(orderDbHandler, 'getOne')
        .mockResolvedValue(null);
      await service.getOrder(mockArguments).catch(() => {});
      expect(target).toHaveBeenCalledWith(mockArguments.orderId);
    });
    it('throws NotFoundException if orderDbHandler.getOne returns null without calling remaining methods', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      /**
       * Note:  The resolved value is not important for this test
       */
      jest.spyOn(orderDbHandler, 'getOne').mockResolvedValue(null);
      jest.spyOn(service, 'getEzManageOrder');
      await service.getOrder(mockArguments).catch((reason) => {
        expect(reason).toEqual(new NotFoundException('Order was not found'));
        expect(service.getEzManageOrder).not.toHaveBeenCalled();
        expect(orderUtils.convertEzManageOrderForOutput).not.toHaveBeenCalled();
      });
    });
    it('calls service.getEzManageOrder with the correct arguments only if orderDbHandler.getOne returns an order record', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockOrderModelWithId: IOrderModelWithId = {
        id: mockArguments.orderId,
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(orderDbHandler, 'getOne')
        .mockResolvedValue(mockOrderModelWithId);

      const mockEzManageOrder: IEzManageOrder = {
        orderNumber: 'FW8M2X',
        uuid: '31d569b3-f7c8-4507-b7aa-d239ba456dac',
        event: {
          timestamp: '2023-06-29T15:15:00Z',
          timeZoneOffset: '-04:00',
          address: {
            city: 'Watkinsville',
            name: 'Piedmont Heart',
            state: 'GA',
            street: '1305 Jennings Mill Rd',
            street2: 'Suite 250',
            street3: null,
            zip: '30677',
          },
          contact: {
            name: 'Frank Sullivan',
            phone: '2298943785',
          },
        },
        orderCustomer: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: {
            subunits: 16920,
          },
          tip: {
            subunits: 0,
          },
        },
        caterer: {
          address: {
            city: 'Athens',
          },
        },
        catererCart: {
          feesAndDiscounts: [
            {
              name: 'Delivery Fee',
              cost: {
                subunits: 2500,
              },
            },
          ],
          orderItems: [
            {
              quantity: 15,
              name: 'Signature Sandwich Boxed Lunches',
              totalInSubunits: {
                subunits: 16920,
              },
              customizations: [
                {
                  customizationTypeName: 'Signature Sandwiches',
                  name: 'Assorted',
                  quantity: 15,
                },
                {
                  customizationTypeName: 'Add Drinks',
                  name: 'Assorted Canned Sodas',
                  quantity: 15,
                },
              ],
            },
          ],
          totals: {
            catererTotalDue: 154.22,
          },
        },
        orderSourceType: 'MARKETPLACE',
      };
      const target = jest
        .spyOn(service, 'getEzManageOrder')
        .mockResolvedValue(mockEzManageOrder);

      const mockEzManageOrderForOutput: Omit<IGetOrderOutput, 'catererName'> = {
        status: UiOrderStatus.PENDING,
        orderNumber: 'FW8M2X',
        sourceType: 'MARKETPLACE',
        event: {
          deliveryTime: new Date(),
          address: {
            city: 'Watkinsville',
            name: 'Piedmont Heart',
            state: 'GA',
            street: '1305 Jennings Mill Rd',
            street2: 'Suite 250',
            street3: null,
            zip: '30677',
          },
          contact: {
            name: 'Frank Sullivan',
            phone: '2298943785',
          },
        },
        contact: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: 169.2,
          catererTotalDue: 154.22,
          tip: 0,
          deliveryFee: 25,
          commission: -39.98,
        },
        items: [
          {
            quantity: 15,
            name: 'Signature Sandwich Boxed Lunches',
            cost: 169.2,
            customizations: [
              {
                customizationTypeName: 'Signature Sandwiches',
                name: 'Assorted',
                quantity: 15,
              },
              {
                customizationTypeName: 'Add Drinks',
                name: 'Assorted Canned Sodas',
                quantity: 15,
              },
            ],
          },
        ],
        itemsAggregate: {
          'Signature Sandwich Boxed Lunches': 15,
        },
      };
      jest
        .spyOn(orderUtils, 'convertEzManageOrderForOutput')
        .mockReturnValue(mockEzManageOrderForOutput);
      await service.getOrder(mockArguments);
      expect(target).toHaveBeenCalledWith(mockArguments);
    });
    it('propagates any error thrown by service.getEzManageOrder', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockOrderModelWithId: IOrderModelWithId = {
        id: mockArguments.orderId,
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(orderDbHandler, 'getOne')
        .mockResolvedValue(mockOrderModelWithId);

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(service, 'getEzManageOrder').mockRejectedValue(mockError);

      await expect(service.getOrder(mockArguments)).rejects.toThrow(mockError);
    });
    it('calls convertEzManageOrderForOutput with the correct arguments', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockOrderModelWithId: IOrderModelWithId = {
        id: mockArguments.orderId,
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(orderDbHandler, 'getOne')
        .mockResolvedValue(mockOrderModelWithId);

      const mockEzManageOrder: IEzManageOrder = {
        orderNumber: 'FW8M2X',
        uuid: '31d569b3-f7c8-4507-b7aa-d239ba456dac',
        event: {
          timestamp: '2023-06-29T15:15:00Z',
          timeZoneOffset: '-04:00',
          address: {
            city: 'Watkinsville',
            name: 'Piedmont Heart',
            state: 'GA',
            street: '1305 Jennings Mill Rd',
            street2: 'Suite 250',
            street3: null,
            zip: '30677',
          },
          contact: {
            name: 'Frank Sullivan',
            phone: '2298943785',
          },
        },
        orderCustomer: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: {
            subunits: 16920,
          },
          tip: {
            subunits: 0,
          },
        },
        caterer: {
          address: {
            city: 'Athens',
          },
        },
        catererCart: {
          feesAndDiscounts: [
            {
              name: 'Delivery Fee',
              cost: {
                subunits: 2500,
              },
            },
          ],
          orderItems: [
            {
              quantity: 15,
              name: 'Signature Sandwich Boxed Lunches',
              totalInSubunits: {
                subunits: 16920,
              },
              customizations: [
                {
                  customizationTypeName: 'Signature Sandwiches',
                  name: 'Assorted',
                  quantity: 15,
                },
                {
                  customizationTypeName: 'Add Drinks',
                  name: 'Assorted Canned Sodas',
                  quantity: 15,
                },
              ],
            },
          ],
          totals: {
            catererTotalDue: 154.22,
          },
        },
        orderSourceType: 'MARKETPLACE',
      };
      jest
        .spyOn(service, 'getEzManageOrder')
        .mockResolvedValue(mockEzManageOrder);

      const mockEzManageOrderForOutput: Omit<IGetOrderOutput, 'catererName'> = {
        status: UiOrderStatus.PENDING,
        orderNumber: 'FW8M2X',
        sourceType: 'MARKETPLACE',
        event: {
          deliveryTime: new Date(),
          address: {
            city: 'Watkinsville',
            name: 'Piedmont Heart',
            state: 'GA',
            street: '1305 Jennings Mill Rd',
            street2: 'Suite 250',
            street3: null,
            zip: '30677',
          },
          contact: {
            name: 'Frank Sullivan',
            phone: '2298943785',
          },
        },
        contact: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: 169.2,
          catererTotalDue: 154.22,
          tip: 0,
          deliveryFee: 25,
          commission: -39.98,
        },
        items: [
          {
            quantity: 15,
            name: 'Signature Sandwich Boxed Lunches',
            cost: 169.2,
            customizations: [
              {
                customizationTypeName: 'Signature Sandwiches',
                name: 'Assorted',
                quantity: 15,
              },
              {
                customizationTypeName: 'Add Drinks',
                name: 'Assorted Canned Sodas',
                quantity: 15,
              },
            ],
          },
        ],
        itemsAggregate: {
          'Signature Sandwich Boxed Lunches': 15,
        },
      };
      jest
        .spyOn(orderUtils, 'convertEzManageOrderForOutput')
        .mockReturnValue(mockEzManageOrderForOutput);
      const result = await service.getOrder(mockArguments);
      expect(result).toEqual({
        ...mockEzManageOrderForOutput,
        catererName: mockOrderModelWithId.catererName,
      });
    });
    it('propagates any error thrown by convertEzManageOrderForOutput', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockOrderModelWithId: IOrderModelWithId = {
        id: mockArguments.orderId,
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(orderDbHandler, 'getOne')
        .mockResolvedValue(mockOrderModelWithId);

      const mockEzManageOrder: IEzManageOrder = {
        orderNumber: 'FW8M2X',
        uuid: '31d569b3-f7c8-4507-b7aa-d239ba456dac',
        event: {
          timestamp: '2023-06-29T15:15:00Z',
          timeZoneOffset: '-04:00',
          address: {
            city: 'Watkinsville',
            name: 'Piedmont Heart',
            state: 'GA',
            street: '1305 Jennings Mill Rd',
            street2: 'Suite 250',
            street3: null,
            zip: '30677',
          },
          contact: {
            name: 'Frank Sullivan',
            phone: '2298943785',
          },
        },
        orderCustomer: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: {
            subunits: 16920,
          },
          tip: {
            subunits: 0,
          },
        },
        caterer: {
          address: {
            city: 'Athens',
          },
        },
        catererCart: {
          feesAndDiscounts: [
            {
              name: 'Delivery Fee',
              cost: {
                subunits: 2500,
              },
            },
          ],
          orderItems: [
            {
              quantity: 15,
              name: 'Signature Sandwich Boxed Lunches',
              totalInSubunits: {
                subunits: 16920,
              },
              customizations: [
                {
                  customizationTypeName: 'Signature Sandwiches',
                  name: 'Assorted',
                  quantity: 15,
                },
                {
                  customizationTypeName: 'Add Drinks',
                  name: 'Assorted Canned Sodas',
                  quantity: 15,
                },
              ],
            },
          ],
          totals: {
            catererTotalDue: 154.22,
          },
        },
        orderSourceType: 'MARKETPLACE',
      };
      jest
        .spyOn(service, 'getEzManageOrder')
        .mockResolvedValue(mockEzManageOrder);

      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderUtils, 'convertEzManageOrderForOutput')
        .mockImplementation(() => {
          throw mockError;
        });
      await expect(service.getOrder(mockArguments)).rejects.toThrow(mockError);
    });
    it('returns object which matches the IGetOrderOutput interface', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockOrderModelWithId: IOrderModelWithId = {
        id: mockArguments.orderId,
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(orderDbHandler, 'getOne')
        .mockResolvedValue(mockOrderModelWithId);

      const mockEzManageOrder: IEzManageOrder = {
        orderNumber: 'FW8M2X',
        uuid: '31d569b3-f7c8-4507-b7aa-d239ba456dac',
        event: {
          timestamp: '2023-06-29T15:15:00Z',
          timeZoneOffset: '-04:00',
          address: {
            city: 'Watkinsville',
            name: 'Piedmont Heart',
            state: 'GA',
            street: '1305 Jennings Mill Rd',
            street2: 'Suite 250',
            street3: null,
            zip: '30677',
          },
          contact: {
            name: 'Frank Sullivan',
            phone: '2298943785',
          },
        },
        orderCustomer: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: {
            subunits: 16920,
          },
          tip: {
            subunits: 0,
          },
        },
        caterer: {
          address: {
            city: 'Athens',
          },
        },
        catererCart: {
          feesAndDiscounts: [
            {
              name: 'Delivery Fee',
              cost: {
                subunits: 2500,
              },
            },
          ],
          orderItems: [
            {
              quantity: 15,
              name: 'Signature Sandwich Boxed Lunches',
              totalInSubunits: {
                subunits: 16920,
              },
              customizations: [
                {
                  customizationTypeName: 'Signature Sandwiches',
                  name: 'Assorted',
                  quantity: 15,
                },
                {
                  customizationTypeName: 'Add Drinks',
                  name: 'Assorted Canned Sodas',
                  quantity: 15,
                },
              ],
            },
          ],
          totals: {
            catererTotalDue: 154.22,
          },
        },
        orderSourceType: 'MARKETPLACE',
      };
      jest
        .spyOn(service, 'getEzManageOrder')
        .mockResolvedValue(mockEzManageOrder);

      const mockEzManageOrderForOutput: Omit<IGetOrderOutput, 'catererName'> = {
        status: UiOrderStatus.PENDING,
        orderNumber: 'FW8M2X',
        sourceType: 'MARKETPLACE',
        event: {
          deliveryTime: new Date(),
          address: {
            city: 'Watkinsville',
            name: 'Piedmont Heart',
            state: 'GA',
            street: '1305 Jennings Mill Rd',
            street2: 'Suite 250',
            street3: null,
            zip: '30677',
          },
          contact: {
            name: 'Frank Sullivan',
            phone: '2298943785',
          },
        },
        contact: {
          firstName: null,
          lastName: null,
        },
        totals: {
          subTotal: 169.2,
          catererTotalDue: 154.22,
          tip: 0,
          deliveryFee: 25,
          commission: -39.98,
        },
        items: [
          {
            quantity: 15,
            name: 'Signature Sandwich Boxed Lunches',
            cost: 169.2,
            customizations: [
              {
                customizationTypeName: 'Signature Sandwiches',
                name: 'Assorted',
                quantity: 15,
              },
              {
                customizationTypeName: 'Add Drinks',
                name: 'Assorted Canned Sodas',
                quantity: 15,
              },
            ],
          },
        ],
        itemsAggregate: {
          'Signature Sandwich Boxed Lunches': 15,
        },
      };
      const target = jest
        .spyOn(orderUtils, 'convertEzManageOrderForOutput')
        .mockReturnValue(mockEzManageOrderForOutput);
      await service.getOrder(mockArguments);
      expect(target).toHaveBeenCalledWith({
        ...mockEzManageOrder,
        status: mockOrderModelWithId.status,
      });
    });
  });
  /**
   * START HERE
   */
  describe('getEzManageOrder', () => {});
  describe('getOrderByName', () => {});
  describe('updateStatuses', () => {});
  describe('deleteOrders', () => {});
  describe('generateLeadFromOrder', () => {});
  describe('getInternalOrderByName', () => {});
  afterEach(() => jest.resetAllMocks());
});
