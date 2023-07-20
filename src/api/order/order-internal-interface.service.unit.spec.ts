import {
  ForbiddenException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
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
          useValue: {
            doesOrderBelongToAccount: jest.fn(),
            getEzManageOrder: jest.fn(),
          },
        },
        {
          provide: OrderDbHandlerService,
          useValue: {
            getAllForAccount: jest.fn(),
            getManyForAccount: jest.fn(),
            getOne: jest.fn(),
            updateOne: jest.fn(),
            delete: jest.fn(),
            findByNameForAccount: jest.fn(),
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
      expect(target).toHaveBeenCalledWith({
        order: mockOrderModelWithId,
        accountId: mockArguments.accountId,
        ref: mockArguments.ref,
      });
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
  describe('getEzManageOrder', () => {
    it('calls orderService.doesOrderBelongToAccount with the correct arguments', async () => {
      const mockDate = new Date();
      const mockArguments = {
        order: {
          id: 'MOCK ORDER ID',
          accountId: 'MOCK NON-MATCHING ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        },
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const target = jest
        .spyOn(orderService, 'doesOrderBelongToAccount')
        .mockResolvedValue(false);
      await service.getEzManageOrder(mockArguments).catch(() => {
        expect(target).toHaveBeenCalledWith({
          input: mockArguments.order,
          accountId: mockArguments.accountId,
        });
      });
    });
    it('throws WRONG_ACCT error if orderService.doesOrderbelongToAccount resolves to false and does not call orderService.getEzManageOrder', async () => {
      const mockDate = new Date();
      const mockArguments = {
        order: {
          id: 'MOCK ORDER ID',
          accountId: 'MOCK NON-MATCHING ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        },
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      jest
        .spyOn(orderService, 'doesOrderBelongToAccount')
        .mockResolvedValue(false);
      jest.spyOn(orderService, 'getEzManageOrder');

      await service.getEzManageOrder(mockArguments).catch((reason) => {
        expect(reason).toEqual(
          new ForbiddenException({ reason: 'WRONG_ACCT' }),
        );
        expect(orderService.getEzManageOrder).not.toHaveBeenCalled();
      });
    });
    it('calls orderService.getEzManageOrder with the correct arguments', async () => {
      const mockDate = new Date();
      const mockArguments = {
        order: {
          id: 'MOCK ORDER ID',
          accountId: 'MOCK NON-MATCHING ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        },
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      jest
        .spyOn(orderService, 'doesOrderBelongToAccount')
        .mockResolvedValue(true);

      const mockResolvedEzManageOrder: IEzManageOrder = {
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
        .spyOn(orderService, 'getEzManageOrder')
        .mockResolvedValue(mockResolvedEzManageOrder);

      await service.getEzManageOrder(mockArguments);
      expect(target).toHaveBeenCalledWith({
        order: mockArguments.order,
        ref: mockArguments.ref,
      });
    });
    it('returns a Promise which resolves to what orderService.getEzManageOrder resolves to', async () => {
      const mockDate = new Date();
      const mockArguments = {
        order: {
          id: 'MOCK ORDER ID',
          accountId: 'MOCK NON-MATCHING ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        },
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      jest
        .spyOn(orderService, 'doesOrderBelongToAccount')
        .mockResolvedValue(true);

      const mockResolvedEzManageOrder: IEzManageOrder = {
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
        .spyOn(orderService, 'getEzManageOrder')
        .mockResolvedValue(mockResolvedEzManageOrder);

      await expect(service.getEzManageOrder(mockArguments)).resolves.toEqual(
        mockResolvedEzManageOrder,
      );
    });
  });
  describe('getOrderByName', () => {
    it('calls service.getInternalOrderByName with correct arguments', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockInternalOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: mockArguments.orderName,
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const target = jest
        .spyOn(service, 'getInternalOrderByName')
        .mockResolvedValue(mockInternalOrder);

      const mockOrderOutput: IGetOrderOutput = {
        status: UiOrderStatus.PENDING,
        catererName: 'MOCK CATERER NAME',
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
      jest.spyOn(service, 'getOrder').mockResolvedValue(mockOrderOutput);

      await service.getOrderByName(mockArguments);
      expect(target).toHaveBeenCalledWith({
        orderName: mockArguments.orderName,
        accountId: mockArguments.accountId,
      });
    });
    it('propagates any error thrown by service.getInternalOrderByName and does not call remaining methods', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(service, 'getInternalOrderByName')
        .mockRejectedValue(mockError);

      jest.spyOn(service, 'getOrder');

      await service.getOrderByName(mockArguments).catch((reason) => {
        expect(reason).toEqual(mockError);
        expect(service.getOrder).not.toHaveBeenCalled();
      });
    });
    it('calls service.getOrder with the correct arguments', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockInternalOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: mockArguments.orderName,
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(service, 'getInternalOrderByName')
        .mockResolvedValue(mockInternalOrder);

      const mockOrderOutput: IGetOrderOutput = {
        status: UiOrderStatus.PENDING,
        catererName: 'MOCK CATERER NAME',
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
      jest.spyOn(service, 'getOrder').mockResolvedValue(mockOrderOutput);

      await service.getOrderByName(mockArguments);
      expect(service.getOrder).toHaveBeenCalledWith({
        orderId: mockInternalOrder.id,
        accountId: mockArguments.accountId,
        ref: mockArguments.ref,
      });
    });
    it('returns a Promise which resolves to what service.getOrder resolves to', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockInternalOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: mockArguments.orderName,
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(service, 'getInternalOrderByName')
        .mockResolvedValue(mockInternalOrder);

      const mockOrderOutput: IGetOrderOutput = {
        status: UiOrderStatus.PENDING,
        catererName: 'MOCK CATERER NAME',
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
      jest.spyOn(service, 'getOrder').mockResolvedValue(mockOrderOutput);

      await expect(service.getOrderByName(mockArguments)).resolves.toEqual(
        mockOrderOutput,
      );
    });
  });
  /**
   * START HERE
   */
  describe('updateStatuses', () => {
    it('resolves with didUpdate false if order is not found', async () => {
      const mockArguments = {
        updates: [{ id: 'MOCK ORDER ID', status: DbOrderStatus.ARCHIVED }],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };

      jest.spyOn(orderDbHandler, 'getOne').mockResolvedValueOnce(null);
      const result = await service.updateStatuses(mockArguments);
      expect(result[0].didUpdate).toEqual(false);
    });
    it('resolves with didUpdate false if order does not belong to account', async () => {
      const mockArguments = {
        updates: [{ id: 'MOCK ORDER ID', status: DbOrderStatus.ARCHIVED }],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };

      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: 'MOCK NON-MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest.spyOn(orderDbHandler, 'getOne').mockResolvedValueOnce(mockOrder);
      const result = await service.updateStatuses(mockArguments);
      expect(result[0].didUpdate).toEqual(false);
    });
    it('resolves with didUpdate false if order status is unchanged', async () => {
      const mockArguments = {
        updates: [{ id: 'MOCK ORDER ID', status: DbOrderStatus.ARCHIVED }],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };

      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ARCHIVED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest.spyOn(orderDbHandler, 'getOne').mockResolvedValueOnce(mockOrder);
      const result = await service.updateStatuses(mockArguments);
      expect(result[0].didUpdate).toEqual(false);
    });
    it('resolves with an array whose length is shorter than the input when orderDbHandler.getOne throws an error', async () => {
      const mockArguments = {
        updates: [{ id: 'MOCK ORDER ID', status: DbOrderStatus.ARCHIVED }],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };

      const mockError = new Error('ANY ERROR');
      jest.spyOn(orderDbHandler, 'getOne').mockRejectedValue(mockError);
      const result = await service.updateStatuses(mockArguments);
      expect(result).toHaveLength(0);
    });
    it('resolves with an array whose length is shorter than the input when orderDbHandler.updateOne throws an error', async () => {
      const mockArguments = {
        updates: [{ id: 'MOCK ORDER ID', status: DbOrderStatus.ARCHIVED }],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };

      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest.spyOn(orderDbHandler, 'getOne').mockResolvedValueOnce(mockOrder);
      jest
        .spyOn(orderDbHandler, 'updateOne')
        .mockRejectedValueOnce(new Error('ANY ERROR'));
      const result = await service.updateStatuses(mockArguments);
      expect(result).toHaveLength(0);
    });
    it('calls orderDbHandler.getOne as many times as the length of incoming updates', async () => {
      const mockArguments = {
        updates: [
          { id: 'MOCK ORDER ID', status: DbOrderStatus.ARCHIVED },
          { id: 'MOCK ORDER ID 2', status: DbOrderStatus.ARCHIVED },
          { id: 'MOCK ORDER ID 3', status: DbOrderStatus.ARCHIVED },
          { id: 'MOCK ORDER ID 4', status: DbOrderStatus.ARCHIVED },
        ],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };

      const mockOrder = null; /** Enabled earliest possible loop termination */
      jest.spyOn(orderDbHandler, 'getOne').mockResolvedValue(mockOrder);
      await service.updateStatuses(mockArguments);
      expect(orderDbHandler.getOne).toHaveBeenCalledTimes(
        mockArguments.updates.length,
      );
    });
    it('calls orderDbHandler.updateOne as many times as passes constraints: order is found, belongs to account, and status is different', async () => {
      const mockArguments = {
        updates: [
          { id: 'MOCK MISSING ORDER ID', status: DbOrderStatus.ARCHIVED },
          { id: 'MOCK ORDER ID 2', status: DbOrderStatus.ARCHIVED },
          { id: 'MOCK ORDER ID 3', status: DbOrderStatus.ARCHIVED },
          { id: 'MOCK MISSING ORDER ID 4', status: DbOrderStatus.ARCHIVED },
        ],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };

      const mockDate = new Date();
      const mockOrder2: IOrderModelWithId = {
        id: 'MOCK ORDER ID 2',
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockOrder3: IOrderModelWithId = {
        id: 'MOCK ORDER ID 3',
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
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockOrder2)
        .mockResolvedValueOnce(mockOrder3)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(orderDbHandler, 'updateOne')
        .mockResolvedValue({ updated: true });
      await service.updateStatuses(mockArguments);
      expect(orderDbHandler.updateOne).toHaveBeenCalledTimes(2);
    });
    it('resolves with didUpdate true if updateOrder is called and returns { didUpdate: true }', async () => {
      const mockArguments = {
        updates: [{ id: 'MOCK ORDER ID', status: DbOrderStatus.ARCHIVED }],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };

      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: mockArguments.updates[0].id,
        accountId: mockArguments.accountId,
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest.spyOn(orderDbHandler, 'getOne').mockResolvedValueOnce(mockOrder);
      jest
        .spyOn(orderDbHandler, 'updateOne')
        .mockResolvedValue({ updated: true });
      const result = await service.updateStatuses(mockArguments);
      expect(result[0].didUpdate).toEqual(true);
    });
  });
  describe('deleteOrders', () => {
    it('calls getManyForAccount with the correct arguments', async () => {
      const mockArguments = {
        orderIds: ['MOCK ORDER ID 1', 'MOCK ORDER ID 2', 'MOCK ORDER ID 3'],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      jest
        .spyOn(orderDbHandler, 'getManyForAccount')
        .mockRejectedValue(new Error('QUICKEST METHOD TERMINATION ERROR'));

      await service.deleteOrders(mockArguments).catch(() => {
        expect(orderDbHandler.getManyForAccount).toHaveBeenCalledWith({
          orderIds: mockArguments.orderIds,
        });
      });
    });
    it('propagates any error thrown by orderDbHandler.getManyForAccount', async () => {
      const mockArguments = {
        orderIds: ['MOCK ORDER ID 1', 'MOCK ORDER ID 2', 'MOCK ORDER ID 3'],
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderDbHandler, 'getManyForAccount')
        .mockRejectedValue(mockError);

      await expect(service.deleteOrders(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('calls orderDbHandler.delete as many times as there are valid orders (found orders with matching account ids)', async () => {
      const mockArguments = {
        orderIds: ['MOCK ORDER ID 1', 'MOCK ORDER ID 2', 'MOCK ORDER ID 3'],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockValidOrder1: IOrderModelWithId = {
        id: mockArguments.orderIds[0],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockInvalidOrder2: IOrderModelWithId = {
        id: mockArguments.orderIds[1],
        accountId: 'MOCK NON-MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockValidOrder3: IOrderModelWithId = {
        id: mockArguments.orderIds[2],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(orderDbHandler, 'getManyForAccount')
        .mockResolvedValue([
          mockValidOrder1,
          mockInvalidOrder2,
          mockValidOrder3,
        ]);
      jest
        .spyOn(orderDbHandler, 'delete')
        .mockResolvedValue({ didDelete: true });

      await service.deleteOrders(mockArguments);
      /**
       * Expected to be called twice because mockInvalidOrder2 has a non-matching accountId
       */
      expect(orderDbHandler.delete).toHaveBeenCalledTimes(2);
    });
    it('returns detailed description of passes and failures', async () => {
      const mockArguments = {
        orderIds: [
          'MOCK ORDER ID 1',
          'MOCK ORDER ID 2',
          'MOCK ORDER ID 3',
          'MOCK ORDER ID 4',
        ],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockValidOrder1: IOrderModelWithId = {
        id: mockArguments.orderIds[0],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockInvalidOrder2: IOrderModelWithId = {
        id: mockArguments.orderIds[1],
        accountId: 'MOCK NON-MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockValidOrder3: IOrderModelWithId = {
        id: mockArguments.orderIds[2],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockValidOrderWhichErrorsOnDelete: IOrderModelWithId = {
        id: mockArguments.orderIds[3],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(orderDbHandler, 'getManyForAccount')
        .mockResolvedValue([
          mockValidOrder1,
          mockInvalidOrder2,
          mockValidOrder3,
          mockValidOrderWhichErrorsOnDelete,
        ]);

      const mockErrorMessage = 'MOCK ERROR MESSAGE';

      jest
        .spyOn(orderDbHandler, 'delete')
        .mockResolvedValueOnce({ didDelete: true })
        .mockResolvedValueOnce({ didDelete: false })
        .mockRejectedValueOnce(new Error(mockErrorMessage));

      const result = await service.deleteOrders(mockArguments);
      expect(result).toEqual({
        deleted: [mockValidOrder1.id],
        didNotDelete: [mockValidOrder3.id],
        deleteErrors: [
          {
            reason: mockErrorMessage,
            orderId: mockValidOrderWhichErrorsOnDelete.id,
          },
        ],
        invalid: [mockInvalidOrder2.id],
      });
    });
    it('settles error cases in async map', async () => {
      const mockArguments = {
        orderIds: [
          'MOCK ORDER ID 1',
          'MOCK ORDER ID 2',
          'MOCK ORDER ID 3',
          'MOCK ORDER ID 4',
        ],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      const mockDate = new Date();
      const mockValidOrder1: IOrderModelWithId = {
        id: mockArguments.orderIds[0],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockInvalidOrder2: IOrderModelWithId = {
        id: mockArguments.orderIds[1],
        accountId: 'MOCK NON-MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockValidOrder3: IOrderModelWithId = {
        id: mockArguments.orderIds[2],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockValidOrderWhichErrorsOnDelete: IOrderModelWithId = {
        id: mockArguments.orderIds[3],
        accountId: 'MOCK MATCHING ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(orderDbHandler, 'getManyForAccount')
        .mockResolvedValue([
          mockValidOrder1,
          mockInvalidOrder2,
          mockValidOrder3,
          mockValidOrderWhichErrorsOnDelete,
        ]);
      jest
        .spyOn(orderDbHandler, 'delete')
        .mockResolvedValueOnce({ didDelete: true })
        .mockResolvedValueOnce({ didDelete: false })
        .mockRejectedValueOnce(new Error('Error case'));

      await expect(service.deleteOrders(mockArguments)).resolves.toBeDefined();
    });
  });
  describe('generateLeadFromOrder', () => {
    it('rejects with NotImplementedException', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
        ref: 'H4H' as ACCOUNT_REF,
      };
      await expect(
        service.generateLeadFromOrder(mockArguments),
      ).rejects.toThrow(
        new NotImplementedException(
          'Order internal service generateLeadFromOrder not implemented',
        ),
      );
    });
  });
  describe('getInternalOrderByName', () => {
    it('calls orderDbHandler.findByNameForAccount with the correct arguments', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
      };
      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: mockArguments.orderName,
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(orderDbHandler, 'findByNameForAccount')
        .mockResolvedValue(mockOrder);
      await service.getInternalOrderByName(mockArguments);
      expect(orderDbHandler.findByNameForAccount).toHaveBeenCalledWith(
        mockArguments.orderName,
        mockArguments.accountId,
      );
    });
    it('passes through the return of orderDbHandler.findByNameForAccount', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
      };
      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: mockArguments.orderName,
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      jest
        .spyOn(orderDbHandler, 'findByNameForAccount')
        .mockResolvedValue(mockOrder);
      await expect(
        service.getInternalOrderByName(mockArguments),
      ).resolves.toEqual(mockOrder);
    });
    it('propagates any error thrown by orderDbHandler.findByNameForAccount', async () => {
      const mockArguments = {
        orderName: 'MOCK ORDER NAME',
        accountId: 'MOCK ACCOUNT ID',
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(orderDbHandler, 'findByNameForAccount')
        .mockRejectedValue(mockError);
      await expect(
        service.getInternalOrderByName(mockArguments),
      ).rejects.toThrow(mockError);
    });
  });
  afterEach(() => jest.resetAllMocks());
});

/**
 * Now that you're at the end, refactor deleteOrders and change the last test
 */
