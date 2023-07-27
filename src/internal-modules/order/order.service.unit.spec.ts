// npx jest --testPathPattern=order.service.unit.spec.ts
import { NotFoundException, NotImplementedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { H4HWarnings } from 'src/external-modules/database/models/H4H';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { CrmHandlerService } from '../external-interface-handlers/crm/crm-handler.service';
import { ACCOUNT_REF } from '../external-interface-handlers/database/account-db-handler/types';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';
import { OrderHelperService } from './order-helper.service';
import { OrderService } from './order.service';

const validAccount: IAccountModelWithId = {
  id: '',
  ref: 'H4H',
  name: '',
  contactEmail: '',
  isActive: false,
  crmUsers: [
    {
      assignFor: 'Gainesville',
      id: 11,
      name: 'Gainesville Rep',
    },
    {
      assignFor: 'Athens',
      id: 43,
      name: 'Athens Rep',
    },
  ],
};

const validInternalOrder: IOrderModelWithId = {
  id: '123',
  accountId: '123',
  catererId: '123',
  catererName: 'Caterer name',
  name: 'GB57GY',
  crmId: '123',
  crmDescription: 'Crm description',
  status: DbOrderStatus.ACCEPTED,
  acceptedAt: new Date(),
  lastUpdatedAt: new Date(),
};

/**
 * @TODO get a real API response for this
 */
const validEzManageOrder: IEzManageOrder = {
  orderNumber: '45HGZ3',
  uuid: 'uuid-1234-5678-91011',
  event: {
    timestamp: '2023-06-27T10:00:00Z',
    timeZoneOffset: '-04:00',
    address: {
      city: 'Test City',
      name: 'Test Name',
      state: 'Test State',
      street: 'Test Street',
      street2: 'Test Street 2',
      street3: 'Test Street 3',
      zip: '12345',
    },
    contact: {
      name: 'Test Contact',
      phone: '123-456-7890',
    },
  },
  orderCustomer: {
    firstName: 'Test',
    lastName: 'Customer',
  },
  totals: {
    subTotal: { subunits: 2000 },
    tip: { subunits: 200 },
  },
  caterer: {
    address: {
      city: 'Test City',
    },
  },
  catererCart: {
    feesAndDiscounts: [
      {
        name: 'Test Fee',
        cost: { subunits: 200 },
      },
    ],
    orderItems: [
      {
        quantity: 1,
        name: 'Test Item',
        totalInSubunits: { subunits: 1000 },
        customizations: [
          {
            customizationTypeName: 'Test Customization',
            name: 'Test Name',
            quantity: 1,
          },
        ],
      },
    ],
    totals: {
      catererTotalDue: 5000,
    },
  },
  orderSourceType: 'Test Source',
};

describe('OrderService', () => {
  let service: OrderService;
  let crmHandler: CrmHandlerService;
  let orderDbService: OrderDbHandlerService;
  let ezManageApiHandler: EzmanageApiHandlerService;
  let orderHelperService: OrderHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        OrderService,
        {
          provide: CrmHandlerService,
          useValue: {
            generateCRMEntity: jest.fn(),
            updateCRMEntityWithOrder: jest.fn(),
          },
        },
        {
          provide: OrderDbHandlerService,
          useValue: {
            create: jest.fn(),
            updateOne: jest.fn(),
            getOne: jest.fn(),
          },
        },
        {
          provide: EzmanageApiHandlerService,
          useValue: {
            getOrder: jest.fn(),
            getOrderName: jest.fn(),
          },
        },
        {
          provide: OrderHelperService,
          useValue: {
            generateIOrderModelFromCrmEntity: jest.fn(),
            tryAppendCrmDataToOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    crmHandler = module.get<CrmHandlerService>(CrmHandlerService);
    ezManageApiHandler = module.get<EzmanageApiHandlerService>(
      EzmanageApiHandlerService,
    );
    orderDbService = module.get<OrderDbHandlerService>(OrderDbHandlerService);
    orderHelperService = module.get<OrderHelperService>(OrderHelperService);
  });

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('crmHandler is defined', () => expect(crmHandler).toBeDefined());
    test('ezManageApiHandler is defined', () =>
      expect(ezManageApiHandler).toBeDefined());
    test('orderDbService is defined', () =>
      expect(orderDbService).toBeDefined());
    test('orderHelperService is defined', () =>
      expect(orderHelperService).toBeDefined());
  });

  /**
   * WRITTEN & PASSING
   */
  describe('createOrder', () => {
    it('calls ezManageApiHandler.getOrder with the correct arguments', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockEzManageOrder = {
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

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      const mockDate = new Date();
      const mockOrderToCreate: IOrderModel = {
        accountId: mockAccount.id,
        catererId: mockArguments.catererId,
        name: mockEzManageOrder.orderNumber,
        status: DbOrderStatus.ACCEPTED,
        crmId: mockFullCrmEntity.id,
        crmDescription: mockFullCrmEntity.description,
        catererName: mockArguments.catererName,
        warnings: [H4HWarnings.SUBTOTAL_MISMATCH.message],
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(service, 'generateCRMEntityFromOrder')
        .mockResolvedValue(mockFullCrmEntity);
      jest
        .spyOn(orderHelperService, 'generateIOrderModelFromCrmEntity')
        .mockReturnValue(mockOrderToCreate);

      await service.createOrder(mockArguments);
      expect(ezManageApiHandler.getOrder).toHaveBeenCalledWith({
        orderId: mockArguments.orderId,
        ref: mockArguments.account.ref,
      });
    });
    it('propagates any error thrown by ezManageApiHandler.getOrder', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(ezManageApiHandler, 'getOrder').mockRejectedValue(mockError);
      await expect(service.createOrder(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('calls service generateCRMEntityFromOrder with correct arguments', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockEzManageOrder = {
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

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      const mockDate = new Date();
      const mockOrderToCreate: IOrderModel = {
        accountId: mockAccount.id,
        catererId: mockArguments.catererId,
        name: mockEzManageOrder.orderNumber,
        status: DbOrderStatus.ACCEPTED,
        crmId: mockFullCrmEntity.id,
        crmDescription: mockFullCrmEntity.description,
        catererName: mockArguments.catererName,
        warnings: [H4HWarnings.SUBTOTAL_MISMATCH.message],
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(service, 'generateCRMEntityFromOrder')
        .mockResolvedValue(mockFullCrmEntity);
      jest
        .spyOn(orderHelperService, 'generateIOrderModelFromCrmEntity')
        .mockReturnValue(mockOrderToCreate);

      await service.createOrder(mockArguments);
      expect(service.generateCRMEntityFromOrder).toHaveBeenCalledWith({
        account: mockArguments.account,
        ezManageOrder: mockEzManageOrder,
      });
    });
    it('propagates any error thrown by service generateCRMEntityFromOrder', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockEzManageOrder = {
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

      const mockError = new Error('ERROR UNDER TEST');

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(service, 'generateCRMEntityFromOrder')
        .mockRejectedValue(mockError);

      await expect(service.createOrder(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('calls orderHelperService.generateIOrderModelFromCrmEntity with correct arguments', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockEzManageOrder = {
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

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      const mockDate = new Date();
      const mockOrderToCreate: IOrderModel = {
        accountId: mockAccount.id,
        catererId: mockArguments.catererId,
        name: mockEzManageOrder.orderNumber,
        status: DbOrderStatus.ACCEPTED,
        crmId: mockFullCrmEntity.id,
        crmDescription: mockFullCrmEntity.description,
        catererName: mockArguments.catererName,
        warnings: [H4HWarnings.SUBTOTAL_MISMATCH.message],
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(service, 'generateCRMEntityFromOrder')
        .mockResolvedValue(mockFullCrmEntity);
      jest
        .spyOn(orderHelperService, 'generateIOrderModelFromCrmEntity')
        .mockReturnValue(mockOrderToCreate);

      await service.createOrder(mockArguments);
      expect(
        orderHelperService.generateIOrderModelFromCrmEntity,
      ).toHaveBeenCalledWith({
        account: mockArguments.account,
        catererId: mockArguments.catererId,
        ezManageOrderNumber: mockEzManageOrder.orderNumber,
        status: mockArguments.status,
        crmEntity: mockFullCrmEntity,
        catererName: mockArguments.catererName,
      });
    });
    it('propagates any error thrown by orderHelperService.generateIOrderModelFromCrmEntity', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockEzManageOrder = {
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

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      const mockError = new Error('ERROR UNDER TEST');

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(service, 'generateCRMEntityFromOrder')
        .mockResolvedValue(mockFullCrmEntity);
      jest
        .spyOn(orderHelperService, 'generateIOrderModelFromCrmEntity')
        .mockImplementation(() => {
          throw mockError;
        });
      await expect(service.createOrder(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('calls orderDbService.create with the correct arguments', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockEzManageOrder = {
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

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      const mockDate = new Date();
      const mockOrderToCreate: IOrderModel = {
        accountId: mockAccount.id,
        catererId: mockArguments.catererId,
        name: mockEzManageOrder.orderNumber,
        status: DbOrderStatus.ACCEPTED,
        crmId: mockFullCrmEntity.id,
        crmDescription: mockFullCrmEntity.description,
        catererName: mockArguments.catererName,
        warnings: [H4HWarnings.SUBTOTAL_MISMATCH.message],
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(service, 'generateCRMEntityFromOrder')
        .mockResolvedValue(mockFullCrmEntity);
      jest
        .spyOn(orderHelperService, 'generateIOrderModelFromCrmEntity')
        .mockReturnValue(mockOrderToCreate);

      await service.createOrder(mockArguments);
      expect(orderDbService.create).toHaveBeenCalledWith({
        orderId: mockArguments.orderId,
        data: mockOrderToCreate,
      });
    });
    it('propagates any error thrown by orderDbService.create', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockEzManageOrder = {
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

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      const mockDate = new Date();
      const mockOrderToCreate: IOrderModel = {
        accountId: mockAccount.id,
        catererId: mockArguments.catererId,
        name: mockEzManageOrder.orderNumber,
        status: DbOrderStatus.ACCEPTED,
        crmId: mockFullCrmEntity.id,
        crmDescription: mockFullCrmEntity.description,
        catererName: mockArguments.catererName,
        warnings: [H4HWarnings.SUBTOTAL_MISMATCH.message],
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(service, 'generateCRMEntityFromOrder')
        .mockResolvedValue(mockFullCrmEntity);
      jest
        .spyOn(orderHelperService, 'generateIOrderModelFromCrmEntity')
        .mockReturnValue(mockOrderToCreate);

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(orderDbService, 'create').mockRejectedValue(mockError);
      await expect(service.createOrder(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('returns void', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        status: DbOrderStatus.ACCEPTED,
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
      };

      const mockEzManageOrder = {
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

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      const mockDate = new Date();
      const mockOrderToCreate: IOrderModel = {
        accountId: mockAccount.id,
        catererId: mockArguments.catererId,
        name: mockEzManageOrder.orderNumber,
        status: DbOrderStatus.ACCEPTED,
        crmId: mockFullCrmEntity.id,
        crmDescription: mockFullCrmEntity.description,
        catererName: mockArguments.catererName,
        warnings: [H4HWarnings.SUBTOTAL_MISMATCH.message],
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(service, 'generateCRMEntityFromOrder')
        .mockResolvedValue(mockFullCrmEntity);
      jest
        .spyOn(orderHelperService, 'generateIOrderModelFromCrmEntity')
        .mockReturnValue(mockOrderToCreate);

      const result = await service.createOrder(mockArguments);
      expect(result).toBeUndefined();
    });
  });
  describe('generateCRMEntityFromOrder', () => {
    it('calls crmHandler.generateCRMEntity with the correct arguments', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockEzManageOrder = {
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

      const mockArguments = {
        account: mockAccount,
        ezManageOrder: mockEzManageOrder,
      };

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      jest
        .spyOn(crmHandler, 'generateCRMEntity')
        .mockResolvedValue(mockFullCrmEntity);

      await service.generateCRMEntityFromOrder(mockArguments);
      expect(crmHandler.generateCRMEntity).toHaveBeenCalledWith({
        account: mockArguments.account,
        order: mockArguments.ezManageOrder,
      });
    });
    it('catches any error thrown by crmHandler.generateCRMEntity and returns undefined instead of throwing error', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockEzManageOrder = {
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

      const mockArguments = {
        account: mockAccount,
        ezManageOrder: mockEzManageOrder,
      };

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(crmHandler, 'generateCRMEntity').mockRejectedValue(mockError);
      expect(
        await service.generateCRMEntityFromOrder(mockArguments),
      ).toBeUndefined();
    });
    describe('crmEntity.id is a string and crmEntity.isSubtotalMatch is boolean false', () => {
      it('calls crmHandler.updateCRMEntityWithOrder with the correct arguments if no crmEntity.tags', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockEzManageOrder = {
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

        const mockArguments = {
          account: mockAccount,
          ezManageOrder: mockEzManageOrder,
        };

        const mockFullCrmEntity = {
          id: 'MOCK CRM ID',
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: false,
        };

        jest
          .spyOn(crmHandler, 'generateCRMEntity')
          .mockResolvedValue(mockFullCrmEntity);

        await service.generateCRMEntityFromOrder(mockArguments);
        expect(crmHandler.updateCRMEntityWithOrder).toHaveBeenCalledWith({
          account: mockArguments.account,
          order: mockArguments.ezManageOrder,
          crmEntityId: mockFullCrmEntity.id,
          additionalAndExistingTags: [H4HWarnings.SUBTOTAL_MISMATCH.crmTag],
        });
      });
      it('calls crmHandler.updateCRMEntityWithOrder with the correct arguments if crmEntity.tags', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockEzManageOrder = {
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

        const mockArguments = {
          account: mockAccount,
          ezManageOrder: mockEzManageOrder,
        };

        const existingTags = ['EXISTING STRING ARRAY ELEMENT'];
        const mockFullCrmEntity = {
          id: 'MOCK CRM ID',
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: false,
          tags: existingTags,
        };

        jest
          .spyOn(crmHandler, 'generateCRMEntity')
          .mockResolvedValue(mockFullCrmEntity);

        await service.generateCRMEntityFromOrder(mockArguments);
        expect(crmHandler.updateCRMEntityWithOrder).toHaveBeenCalledWith({
          account: mockArguments.account,
          order: mockArguments.ezManageOrder,
          crmEntityId: mockFullCrmEntity.id,
          additionalAndExistingTags: [
            ...existingTags,
            H4HWarnings.SUBTOTAL_MISMATCH.crmTag,
          ],
        });
      });
      it('propagates any error thrown by crmHandler.updateCRMEntityWithOrder', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockEzManageOrder = {
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

        const mockArguments = {
          account: mockAccount,
          ezManageOrder: mockEzManageOrder,
        };

        const mockFullCrmEntity = {
          id: 'MOCK CRM ID',
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: false,
        };

        jest
          .spyOn(crmHandler, 'generateCRMEntity')
          .mockResolvedValue(mockFullCrmEntity);

        const mockError = new Error('ERROR UNDER TEST');
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockRejectedValue(mockError);

        await expect(
          service.generateCRMEntityFromOrder(mockArguments),
        ).rejects.toThrow(mockError);
      });
    });

    describe('crmEntity.id is not a string OR crmEntity.isSubtotalMatch is not boolean false', () => {
      it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.id is undefined', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockEzManageOrder = {
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

        const mockArguments = {
          account: mockAccount,
          ezManageOrder: mockEzManageOrder,
        };

        const mockFullCrmEntity = {
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: false,
        };

        jest
          .spyOn(crmHandler, 'generateCRMEntity')
          .mockResolvedValue(mockFullCrmEntity);

        await service.generateCRMEntityFromOrder(mockArguments);
        expect(crmHandler.updateCRMEntityWithOrder).not.toHaveBeenCalled();
      });
      it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.id is not a string', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockEzManageOrder = {
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

        const mockArguments = {
          account: mockAccount,
          ezManageOrder: mockEzManageOrder,
        };

        const mockFullCrmEntity = {
          id: 1234,
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: false,
        };

        jest
          .spyOn(crmHandler, 'generateCRMEntity')
          .mockResolvedValue(mockFullCrmEntity);

        await service.generateCRMEntityFromOrder(mockArguments);
        expect(crmHandler.updateCRMEntityWithOrder).not.toHaveBeenCalled();
      });
      it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.isSubtotalMatch is not a boolean', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockEzManageOrder = {
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

        const mockArguments = {
          account: mockAccount,
          ezManageOrder: mockEzManageOrder,
        };

        const mockFullCrmEntity = {
          id: 'MOCK CRM ID',
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: 'false',
        };

        jest
          .spyOn(crmHandler, 'generateCRMEntity')
          .mockResolvedValue(mockFullCrmEntity);

        await service.generateCRMEntityFromOrder(mockArguments);
        expect(crmHandler.updateCRMEntityWithOrder).not.toHaveBeenCalled();
      });
      it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.isSubtotalMatch is true', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockEzManageOrder = {
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

        const mockArguments = {
          account: mockAccount,
          ezManageOrder: mockEzManageOrder,
        };

        const mockFullCrmEntity = {
          id: 'MOCK CRM ID',
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: true,
        };

        jest
          .spyOn(crmHandler, 'generateCRMEntity')
          .mockResolvedValue(mockFullCrmEntity);

        await service.generateCRMEntityFromOrder(mockArguments);
        expect(crmHandler.updateCRMEntityWithOrder).not.toHaveBeenCalled();
      });
    });
    it('returns crmEntity on success', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockEzManageOrder = {
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

      const mockArguments = {
        account: mockAccount,
        ezManageOrder: mockEzManageOrder,
      };

      const mockFullCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };

      jest
        .spyOn(crmHandler, 'generateCRMEntity')
        .mockResolvedValue(mockFullCrmEntity);

      const result = await service.generateCRMEntityFromOrder(mockArguments);
      expect(result).toEqual(mockFullCrmEntity);
    });
  });
  describe('updateOrder', () => {
    it('calls ezManageApiHandler.getOrder with the correct arguments', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockDate = new Date();
      const mockOrderArgument: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockAccount.id,
        catererId: 'MOCK CATERER ID',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        crmId: 'MOCK CRM ID',
        crmDescription: 'MOCK CRM DESCRIPTION',
        catererName: 'MOCK CATERER NAME',
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
        internalOrder: mockOrderArgument,
      };
      await service.updateOrder(mockArguments);
      expect(ezManageApiHandler.getOrder).toHaveBeenCalledWith({
        orderId: mockArguments.internalOrder.id,
        ref: mockArguments.account.ref,
      });
    });
    it('propagates any error from ezManageApiHandler.getOrder', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockDate = new Date();
      const mockOrderArgument: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockAccount.id,
        catererId: 'MOCK CATERER ID',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        crmId: 'MOCK CRM ID',
        crmDescription: 'MOCK CRM DESCRIPTION',
        catererName: 'MOCK CATERER NAME',
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
        internalOrder: mockOrderArgument,
      };

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(ezManageApiHandler, 'getOrder').mockRejectedValue(mockError);
      await expect(service.updateOrder(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    describe('internalOrder.crmId is undefined', () => {
      it('calls service generateCRMEntityFromOrder with the correct arguments', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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

        const mockFullCrmEntity = {
          id: 'CRM ENTITY ID',
          description: 'CRM ENTITY DESCRIPTION',
          isSubtotalMatch: true,
        };

        const crmAppendedOrderUpdates = {
          lastUpdatedAt: mockDate,
          crmId: mockFullCrmEntity.id,
          crmDescription: mockFullCrmEntity.description,
        };

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(service, 'generateCRMEntityFromOrder')
          .mockResolvedValue(mockFullCrmEntity);
        jest
          .spyOn(orderHelperService, 'tryAppendCrmDataToOrder')
          .mockReturnValue(crmAppendedOrderUpdates);

        await service.updateOrder(mockArguments);
        expect(service.generateCRMEntityFromOrder).toHaveBeenCalledWith({
          account: mockArguments.account,
          ezManageOrder: mockEzManageOrder,
        });
      });
      it('propagates any error thrown from service generateCRMEntityFromOrder', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgumentWithoutCRMIt: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgumentWithoutCRMIt,
        };

        const mockEzManageOrder = {
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

        const mockError = new Error('ERROR UNDER TEST');

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(service, 'generateCRMEntityFromOrder')
          .mockRejectedValue(mockError);
        await expect(service.updateOrder(mockArguments)).rejects.toThrow(
          mockError,
        );
      });
      it('calls orderHelperService.tryAppendCrmDataToOrder with the correct arguments', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgumentWithoutCRMID: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgumentWithoutCRMID,
        };

        const mockEzManageOrder = {
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

        const mockFullCrmEntity = {
          id: 'CRM ENTITY ID',
          description: 'CRM ENTITY DESCRIPTION',
          isSubtotalMatch: true,
        };

        const crmAppendedOrderUpdates = {
          lastUpdatedAt: mockDate,
          crmId: mockFullCrmEntity.id,
          crmDescription: mockFullCrmEntity.description,
        };

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(service, 'generateCRMEntityFromOrder')
          .mockResolvedValue(mockFullCrmEntity);
        jest
          .spyOn(orderHelperService, 'tryAppendCrmDataToOrder')
          .mockReturnValue(crmAppendedOrderUpdates);

        await service.updateOrder(mockArguments);
        expect(orderHelperService.tryAppendCrmDataToOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            crmEntity: mockFullCrmEntity,
            order: expect.objectContaining({
              lastUpdatedAt: expect.any(Date),
            }),
          }),
        );
      });
      it('propagates any error thrown by orderHelperService.tryAppendCrmDataToOrder', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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

        const mockFullCrmEntity = {
          id: 'CRM ENTITY ID',
          description: 'CRM ENTITY DESCRIPTION',
          isSubtotalMatch: true,
        };

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(service, 'generateCRMEntityFromOrder')
          .mockResolvedValue(mockFullCrmEntity);

        const mockError = new Error('ERROR UNDER TEST');
        jest
          .spyOn(orderHelperService, 'tryAppendCrmDataToOrder')
          .mockImplementation(() => {
            throw mockError;
          });
        await expect(service.updateOrder(mockArguments)).rejects.toThrow(
          mockError,
        );
      });
      it('does not call crmHandler.updateCRMEntityWithOrder', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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

        const mockFullCrmEntity = {
          id: 'CRM ENTITY ID',
          description: 'CRM ENTITY DESCRIPTION',
          isSubtotalMatch: true,
        };

        const mockAppendedOrder: Partial<
          Omit<IOrderModel, 'accountId' | 'catererId' | 'catererName'>
        > = {
          lastUpdatedAt: mockDate,
          crmId: mockFullCrmEntity.id,
          crmDescription: mockFullCrmEntity.description,
        };

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(service, 'generateCRMEntityFromOrder')
          .mockResolvedValue(mockFullCrmEntity);
        jest
          .spyOn(orderHelperService, 'tryAppendCrmDataToOrder')
          .mockReturnValue(mockAppendedOrder);
        await service.updateOrder(mockArguments);
        expect(crmHandler.updateCRMEntityWithOrder).not.toHaveBeenCalled();
      });
      it('calls orderDbService.updateOne with updates as the value returned from orderHelperService.tryAppendCrmDataToOrder', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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

        const mockFullCrmEntity = {
          id: 'CRM ENTITY ID',
          description: 'CRM ENTITY DESCRIPTION',
          isSubtotalMatch: true,
        };

        const mockAppendedOrder: Partial<
          Omit<IOrderModel, 'accountId' | 'catererId' | 'catererName'>
        > = {
          lastUpdatedAt: mockDate,
          crmId: mockFullCrmEntity.id,
          crmDescription: mockFullCrmEntity.description,
        };

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(service, 'generateCRMEntityFromOrder')
          .mockResolvedValue(mockFullCrmEntity);
        jest
          .spyOn(orderHelperService, 'tryAppendCrmDataToOrder')
          .mockReturnValue(mockAppendedOrder);
        await service.updateOrder(mockArguments);
        expect(orderDbService.updateOne).toHaveBeenCalledWith({
          orderId: mockArguments.internalOrder.id,
          updates: mockAppendedOrder,
        });
      });
      it('does not call orderDbService.updateOne if no crm properties to update on order', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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

        const mockFullCrmEntity = {
          isSubtotalMatch: true,
        };

        const mockAppendedOrder: Partial<
          Omit<IOrderModel, 'accountId' | 'catererId' | 'catererName'>
        > = {
          lastUpdatedAt: mockDate,
        };

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(service, 'generateCRMEntityFromOrder')
          .mockResolvedValue(mockFullCrmEntity);
        jest
          .spyOn(orderHelperService, 'tryAppendCrmDataToOrder')
          .mockReturnValue(mockAppendedOrder);
        await service.updateOrder(mockArguments);
        expect(orderDbService.updateOne).not.toHaveBeenCalled();
      });
    });
    describe('internalOrder.crmId is not undefined', () => {
      it('does not call service generateCRMEntityFromOrder', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmId: 'MOCK CRM ID',
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest.spyOn(service, 'generateCRMEntityFromOrder');

        await service.updateOrder(mockArguments);
        expect(service.generateCRMEntityFromOrder).not.toHaveBeenCalled();
      });
      it('does not call orderHelperService.tryAppendCrmDataToOrder', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmId: 'MOCK CRM ID',
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest.spyOn(service, 'generateCRMEntityFromOrder');

        await service.updateOrder(mockArguments);
        expect(
          orderHelperService.tryAppendCrmDataToOrder,
        ).not.toHaveBeenCalled();
      });
      it('calls crmHandler.updateCRMEntityWithOrder with the correct arguments', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmId: 'MOCK CRM ID',
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);

        await service.updateOrder(mockArguments);
        expect(crmHandler.updateCRMEntityWithOrder).toHaveBeenCalledWith({
          account: mockArguments.account,
          order: mockEzManageOrder,
          crmEntityId: mockArguments.internalOrder.crmId,
        });
      });
      it('calls orderDbService.updateOne with updates including crmDescription if returned from crmHandler.updateCRMEntityWithOrder', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmId: 'MOCK CRM ID',
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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

        const mockUpdateResult = {
          crmDescription: 'MOCK UPDATED CRM DESCRIPTION',
        };

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue(mockUpdateResult);

        await service.updateOrder(mockArguments);
        expect(orderDbService.updateOne).toHaveBeenCalledWith({
          orderId: mockArguments.internalOrder.id,
          updates: expect.objectContaining({
            crmDescription: mockUpdateResult.crmDescription,
            lastUpdatedAt: expect.any(Date),
          }),
        });
      });
      it('does not call orderDbService.updateOne if crmDescription is not included in updateResult', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmId: 'MOCK CRM ID',
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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

        const mockUpdateResult = {};

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue(mockUpdateResult);

        await service.updateOrder(mockArguments);
        expect(orderDbService.updateOne).not.toHaveBeenCalled();
      });
      it('does not call orderDbService.updateOne if updateResult.crmDescription matches existing crmDescription', async () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };

        const mockDate = new Date();
        const mockOrderArgument: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: mockAccount.id,
          catererId: 'MOCK CATERER ID',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          crmId: 'MOCK CRM ID',
          crmDescription: 'MOCK CRM DESCRIPTION',
          catererName: 'MOCK CATERER NAME',
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };

        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          occurredAt: 'MOCK OCCURRED AT',
          catererName: 'MOCK CATERER NAME',
          internalOrder: mockOrderArgument,
        };

        const mockEzManageOrder = {
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

        const mockUpdateResult = {
          crmDescription: mockArguments.internalOrder.crmDescription,
        };

        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockResolvedValue(mockEzManageOrder);
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue(mockUpdateResult);

        await service.updateOrder(mockArguments);
        expect(orderDbService.updateOne).not.toHaveBeenCalled();
      });
    });
    it('propagates any error thrown by orderDbService.updateOne', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockDate = new Date();
      const mockOrderArgument: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockAccount.id,
        catererId: 'MOCK CATERER ID',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        crmId: 'MOCK CRM ID',
        crmDescription: 'MOCK CRM DESCRIPTION',
        catererName: 'MOCK CATERER NAME',
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
        internalOrder: mockOrderArgument,
      };

      const mockEzManageOrder = {
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

      const mockUpdateResult = {
        crmDescription: 'MOCK UPDATED CRM DESCRIPTION',
      };

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(crmHandler, 'updateCRMEntityWithOrder')
        .mockResolvedValue(mockUpdateResult);

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(orderDbService, 'updateOne').mockRejectedValue(mockError);

      await expect(service.updateOrder(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('resolves to void on success', async () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };

      const mockDate = new Date();
      const mockOrderArgument: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: mockAccount.id,
        catererId: 'MOCK CATERER ID',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        crmId: 'MOCK CRM ID',
        crmDescription: 'MOCK CRM DESCRIPTION',
        catererName: 'MOCK CATERER NAME',
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        occurredAt: 'MOCK OCCURRED AT',
        catererName: 'MOCK CATERER NAME',
        internalOrder: mockOrderArgument,
      };

      const mockEzManageOrder = {
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

      const mockUpdateResult = {
        crmDescription: 'MOCK UPDATED CRM DESCRIPTION',
      };

      jest
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      jest
        .spyOn(crmHandler, 'updateCRMEntityWithOrder')
        .mockResolvedValue(mockUpdateResult);

      const result = await service.updateOrder(mockArguments);
      expect(result).toBeUndefined();
    });
  });
  describe('handleCancelledOrder', () => {
    it('throws NotImplementedException', async () => {
      await expect(
        service.handleCancelledOrder('MOCK ORDER ID'),
      ).rejects.toThrow(new NotImplementedException());
    });
  });
  describe('doesOrderBelongToAccount', () => {
    describe('"input" argument is string', () => {
      it('calls orderDbService.getOne with the correct arguments', async () => {
        const mockArguments = {
          input: 'MOCK INPUT STRING',
          accountId: 'MOCK ACCOUNT ID',
        };
        const mockDate = new Date();
        const mockOrder: IOrderModelWithId = {
          id: mockArguments.input,
          accountId: 'MOCK ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };
        jest.spyOn(orderDbService, 'getOne').mockResolvedValue(mockOrder);
        await service.doesOrderBelongToAccount(mockArguments);
        expect(orderDbService.getOne).toHaveBeenCalledWith(mockArguments.input);
      });
      it('propagates any error thrown by orderDbService.getOne', async () => {
        const mockArguments = {
          input: 'MOCK INPUT STRING',
          accountId: 'MOCK ACCOUNT ID',
        };
        const mockError = new Error('ERROR UNDER TEST');
        jest.spyOn(orderDbService, 'getOne').mockRejectedValue(mockError);
        await expect(
          service.doesOrderBelongToAccount(mockArguments),
        ).rejects.toThrow(mockError);
      });
      it('returns true if order.accountId equals "accountId" argument', async () => {
        const mockArguments = {
          input: 'MOCK INPUT STRING',
          accountId: 'MOCK ACCOUNT ID',
        };
        const mockDate = new Date();
        const mockOrder: IOrderModelWithId = {
          id: mockArguments.input,
          accountId: 'MOCK ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };
        jest.spyOn(orderDbService, 'getOne').mockResolvedValue(mockOrder);
        const result = await service.doesOrderBelongToAccount(mockArguments);
        expect(result).toEqual(true);
      });
      it('returns false if order.AccountId does not equal "accountId" argument', async () => {
        const mockArguments = {
          input: 'MOCK INPUT STRING',
          accountId: 'MOCK ACCOUNT ID',
        };
        const mockDate = new Date();
        const mockOrder: IOrderModelWithId = {
          id: mockArguments.input,
          accountId: 'MOCK NON-MATCHING ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };
        jest.spyOn(orderDbService, 'getOne').mockResolvedValue(mockOrder);
        const result = await service.doesOrderBelongToAccount(mockArguments);
        expect(result).toEqual(false);
      });
    });
    describe('"input" argument is an object matching the IOrderModelWithId interface', () => {
      it('does not call orderDbService.getOne if input argument is not string', async () => {
        const mockDate = new Date();
        const mockOrder: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: 'MOCK ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };
        const mockArguments = {
          input: mockOrder,
          accountId: 'MOCK ACCOUNT ID',
        };
        await service.doesOrderBelongToAccount(mockArguments);
        expect(orderDbService.getOne).not.toHaveBeenCalled();
      });
      it('returns true if order.accountId equals "accountId" argument', async () => {
        const mockDate = new Date();
        const mockOrder: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: 'MOCK ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };
        const mockArguments = {
          input: mockOrder,
          accountId: 'MOCK ACCOUNT ID',
        };
        const result = await service.doesOrderBelongToAccount(mockArguments);
        expect(result).toEqual(true);
      });
      it('returns false if order.AccountId does not equal "accountId" argument', async () => {
        const mockDate = new Date();
        const mockOrder: IOrderModelWithId = {
          id: 'MOCK ORDER ID',
          accountId: 'MOCK ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: mockDate,
          lastUpdatedAt: mockDate,
        };
        const mockArguments = {
          input: mockOrder,
          accountId: 'MOCK NON-MATCHING ACCOUNT ID',
        };
        const result = await service.doesOrderBelongToAccount(mockArguments);
        expect(result).toEqual(false);
      });
    });
    it('throws NotFoundException if order is null', async () => {
      const mockArguments = {
        input: 'MOCK INPUT STRING',
        accountId: 'MOCK ACCOUNT ID',
      };
      const mockOrder = null;
      jest.spyOn(orderDbService, 'getOne').mockResolvedValue(mockOrder);
      await expect(
        service.doesOrderBelongToAccount(mockArguments),
      ).rejects.toThrow(new NotFoundException());
    });
  });
  describe('getEzManageOrder', () => {
    it('calls ezManageApiHandler.getOrder with the correct arguments', async () => {
      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockArguments = {
        order: mockOrder,
        ref: 'ADMIN' as ACCOUNT_REF,
      };
      const mockEzManageOrder = {
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
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      await service.getEzManageOrder(mockArguments);
      expect(ezManageApiHandler.getOrder).toHaveBeenCalledWith({
        orderId: mockArguments.order.id,
        ref: mockArguments.ref,
      });
    });
    it('propagates any error thrown by ezManageApiHandler.getOrder', async () => {
      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockArguments = {
        order: mockOrder,
        ref: 'ADMIN' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(ezManageApiHandler, 'getOrder').mockRejectedValue(mockError);
      await expect(service.getEzManageOrder(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('resolves to the return from ezManageApiHandler.getOrder', async () => {
      const mockDate = new Date();
      const mockOrder: IOrderModelWithId = {
        id: 'MOCK ORDER ID',
        accountId: 'MOCK ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };
      const mockArguments = {
        order: mockOrder,
        ref: 'ADMIN' as ACCOUNT_REF,
      };
      const mockEzManageOrder = {
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
        .spyOn(ezManageApiHandler, 'getOrder')
        .mockResolvedValue(mockEzManageOrder);
      const result = await service.getEzManageOrder(mockArguments);
      expect(result).toEqual(mockEzManageOrder);
    });
  });
  describe('getOrderName', () => {
    it('calls ezManageApihandler.getOrderName with the correct arguments', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        ref: 'ADMIN' as ACCOUNT_REF,
      };
      const mockOrderName = 'MOCK ORDER NAME';
      jest
        .spyOn(ezManageApiHandler, 'getOrderName')
        .mockResolvedValue(mockOrderName);
      await service.getOrderName(mockArguments);
      expect(ezManageApiHandler.getOrderName).toHaveBeenCalledWith(
        mockArguments,
      );
    });
    it('propagates any error thrown by ezManageApiHandler.getOrderName', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        ref: 'ADMIN' as ACCOUNT_REF,
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(ezManageApiHandler, 'getOrderName')
        .mockRejectedValue(mockError);
      await expect(service.getOrderName(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('resolves to the return from ezManageApiHandler.getOrderName', async () => {
      const mockArguments = {
        orderId: 'MOCK ORDER ID',
        ref: 'ADMIN' as ACCOUNT_REF,
      };
      const mockOrderName = 'MOCK ORDER NAME';
      jest
        .spyOn(ezManageApiHandler, 'getOrderName')
        .mockResolvedValue(mockOrderName);
      const result = await service.getOrderName(mockArguments);
      expect(result).toEqual(mockOrderName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
