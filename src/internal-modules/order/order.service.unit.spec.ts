// npx jest --testPathPattern=order.service.unit.spec.ts
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CrmError, InternalError, OrderManagerError } from 'src/common/classes';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { H4HWarnings } from 'src/external-modules/database/models/H4H';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { CrmHandlerService } from '../external-interface-handlers/crm/crm-handler.service';
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
          },
        },
        {
          provide: EzmanageApiHandlerService,
          useValue: {
            getOrder: jest.fn(),
          },
        },
        {
          provide: OrderHelperService,
          useValue: {
            generateIOrderModelFromCrmEntity: jest.fn(),
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
    // it('calls crmHandler.generateCRMEntity with the correct arguments', async () => {
    //   const mockAccount: IAccountModelWithId = {
    //     id: 'MOCK ACCOUNT ID',
    //     ref: 'H4H',
    //     name: 'MOCK ACCOUNT NAME',
    //     contactEmail: 'MOCK ACCOUNT EMAIL',
    //     isActive: true,
    //   };

    //   const mockEzManageOrder = {
    //     orderNumber: 'FW8M2X',
    //     uuid: '31d569b3-f7c8-4507-b7aa-d239ba456dac',
    //     event: {
    //       timestamp: '2023-06-29T15:15:00Z',
    //       timeZoneOffset: '-04:00',
    //       address: {
    //         city: 'Watkinsville',
    //         name: 'Piedmont Heart',
    //         state: 'GA',
    //         street: '1305 Jennings Mill Rd',
    //         street2: 'Suite 250',
    //         street3: null,
    //         zip: '30677',
    //       },
    //       contact: {
    //         name: 'Frank Sullivan',
    //         phone: '2298943785',
    //       },
    //     },
    //     orderCustomer: {
    //       firstName: null,
    //       lastName: null,
    //     },
    //     totals: {
    //       subTotal: {
    //         subunits: 16920,
    //       },
    //       tip: {
    //         subunits: 0,
    //       },
    //     },
    //     caterer: {
    //       address: {
    //         city: 'Athens',
    //       },
    //     },
    //     catererCart: {
    //       feesAndDiscounts: [
    //         {
    //           name: 'Delivery Fee',
    //           cost: {
    //             subunits: 2500,
    //           },
    //         },
    //       ],
    //       orderItems: [
    //         {
    //           quantity: 15,
    //           name: 'Signature Sandwich Boxed Lunches',
    //           totalInSubunits: {
    //             subunits: 16920,
    //           },
    //           customizations: [
    //             {
    //               customizationTypeName: 'Signature Sandwiches',
    //               name: 'Assorted',
    //               quantity: 15,
    //             },
    //             {
    //               customizationTypeName: 'Add Drinks',
    //               name: 'Assorted Canned Sodas',
    //               quantity: 15,
    //             },
    //           ],
    //         },
    //       ],
    //       totals: {
    //         catererTotalDue: 154.22,
    //       },
    //     },
    //     orderSourceType: 'MARKETPLACE',
    //   };

    //   const mockArguments = {
    //     account: mockAccount,
    //     ezManageOrder: mockEzManageOrder,
    //   };

    //   const mockFullCrmEntity = {
    //     id: 'MOCK CRM ID',
    //     description: 'MOCK CRM DESCRIPTION',
    //     isSubtotalMatch: true,
    //   };

    //   jest
    //     .spyOn(crmHandler, 'generateCRMEntity')
    //     .mockResolvedValue(mockFullCrmEntity);

    //   await service.generateCRMEntityFromOrder(mockArguments);
    //   expect(crmHandler.generateCRMEntity).toHaveBeenCalledWith({
    //     account: mockArguments.account,
    //     order: mockArguments.ezManageOrder,
    //   });
    // });
    // it('catches any error thrown by crmHandler.generateCRMEntity and returns undefined instead of throwing error', async () => {
    //   const mockAccount: IAccountModelWithId = {
    //     id: 'MOCK ACCOUNT ID',
    //     ref: 'H4H',
    //     name: 'MOCK ACCOUNT NAME',
    //     contactEmail: 'MOCK ACCOUNT EMAIL',
    //     isActive: true,
    //   };

    //   const mockEzManageOrder = {
    //     orderNumber: 'FW8M2X',
    //     uuid: '31d569b3-f7c8-4507-b7aa-d239ba456dac',
    //     event: {
    //       timestamp: '2023-06-29T15:15:00Z',
    //       timeZoneOffset: '-04:00',
    //       address: {
    //         city: 'Watkinsville',
    //         name: 'Piedmont Heart',
    //         state: 'GA',
    //         street: '1305 Jennings Mill Rd',
    //         street2: 'Suite 250',
    //         street3: null,
    //         zip: '30677',
    //       },
    //       contact: {
    //         name: 'Frank Sullivan',
    //         phone: '2298943785',
    //       },
    //     },
    //     orderCustomer: {
    //       firstName: null,
    //       lastName: null,
    //     },
    //     totals: {
    //       subTotal: {
    //         subunits: 16920,
    //       },
    //       tip: {
    //         subunits: 0,
    //       },
    //     },
    //     caterer: {
    //       address: {
    //         city: 'Athens',
    //       },
    //     },
    //     catererCart: {
    //       feesAndDiscounts: [
    //         {
    //           name: 'Delivery Fee',
    //           cost: {
    //             subunits: 2500,
    //           },
    //         },
    //       ],
    //       orderItems: [
    //         {
    //           quantity: 15,
    //           name: 'Signature Sandwich Boxed Lunches',
    //           totalInSubunits: {
    //             subunits: 16920,
    //           },
    //           customizations: [
    //             {
    //               customizationTypeName: 'Signature Sandwiches',
    //               name: 'Assorted',
    //               quantity: 15,
    //             },
    //             {
    //               customizationTypeName: 'Add Drinks',
    //               name: 'Assorted Canned Sodas',
    //               quantity: 15,
    //             },
    //           ],
    //         },
    //       ],
    //       totals: {
    //         catererTotalDue: 154.22,
    //       },
    //     },
    //     orderSourceType: 'MARKETPLACE',
    //   };

    //   const mockArguments = {
    //     account: mockAccount,
    //     ezManageOrder: mockEzManageOrder,
    //   };

    //   const mockError = new Error('ERROR UNDER TEST');
    //   jest.spyOn(crmHandler, 'generateCRMEntity').mockRejectedValue(mockError);
    //   expect(
    //     await service.generateCRMEntityFromOrder(mockArguments),
    //   ).toBeUndefined();
    // });
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
    /**
     * START HERE
     */
    describe('crmEntity.id is not a string OR crmEntity.isSubtotalMatch is not boolean false', () => {
      it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.id is undefined', async () => {});
      it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.id is not a string', async () => {});
      it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.isSubtotalMatch is not a boolean', async () => {});
      it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.isSubtotalMatch is true', async () => {});
    });
    it('returns crmEntity on success', async () => {});
  });
  describe('updateOrder', () => {
    it('calls ezManageApiHandler.getOrder with the correct arguments', async () => {});
    it('propagates any error from ezManageApiHandler.getOrder', async () => {});
    describe('internalOrder.crmId is undefined', () => {
      it('calls service generateCRMEntityFromOrder with the correct arguments', async () => {});
      it('propagates any error thrown from service generateCRMEntityFromOrder', async () => {});
      it('calls orderHelperService.tryAppendCrmDataToOrder with the correct arguments', async () => {});
      it('propagates any error thrown by orderHelperService.tryAppendCrmDataToOrder', async () => {});
    });
    describe('internalOrder.crmId is defined', () => {
      it('calls crmHandler.updateCRMEntityWithOrder with the correct arguments', async () => {});
    });
    it('calls orderDbService.updateOne with the correct arguments', async () => {});
    it('propagates any error thrown by orderDbService.updateOne', async () => {});
    it('resolves to void on success', async () => {});
  });
  describe('handleCancelledOrder', () => {
    it('throws NotImplementedException', async () => {});
  });
  describe('doesOrderBelongToAccount', () => {
    describe('"input" argument is string', () => {
      it('calls orderDbService.getOne with the correct arguments', async () => {});
      it('propagates any error thrown by orderDbService.getOne', async () => {});
    });
    describe('"input" argument is not string', () => {
      it('does not call orderDbService.getOne if input argument is not string', async () => {});
    });
    it('throws NotFoundException if order is null', async () => {});
    it('returns true if order.accountId equals "accountId" argument', async () => {});
    it('returns false if order.AccountId does not equal "accountId" argument', async () => {});
  });
  describe('getEzManageOrder', () => {
    it('calls ezManageApiHandler.getOrder with the correct arguments', async () => {});
    it('propagates any error thrown by ezManageApiHandler.getOrder', async () => {});
    it('resolves to the return from ezManageApiHandler.getOrder', async () => {});
  });
  describe('getOrderName', () => {
    it('calls ezManageApihandler.getOrderName with the correct arguments', async () => {});
    it('propagates any error thrown by ezManageApiHandler.getOrderName', async () => {});
    it('resolves to the return from ezManageApiHandler.getOrderName', async () => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
