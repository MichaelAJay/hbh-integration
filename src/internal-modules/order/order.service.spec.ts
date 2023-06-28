import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { CrmHandlerService } from '../external-interface-handlers/crm/crm-handler.service';
import { CrmModule } from '../external-interface-handlers/crm/crm.module';
import { InternalDatabaseModule } from '../external-interface-handlers/database/database.module';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerModule } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.module';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';
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
  let crmHandler;
  let orderDbService;
  let ezManageApiHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        InternalDatabaseModule,
        EzmanageApiHandlerModule,
        CrmModule,
        CustomLoggerModule,
      ],
      providers: [
        OrderService,
        {
          provide: EzmanageApiHandlerService,
          useValue: { getOrder: jest.fn() },
        },
        {
          provide: CrmHandlerService,
          useValue: {
            generateCRMEntity: jest.fn(),
            updateCRMEntityWithOrder: jest.fn(),
          },
        },
        {
          provide: OrderDbHandlerService,
          useValue: { updateOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    crmHandler = module.get(CrmHandlerService);
    ezManageApiHandler = module.get(EzmanageApiHandlerService);
    orderDbService = module.get(OrderDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    // individual tests
  });

  describe('updateOrder', () => {
    // individual tests
    it('should throw an error if ezManageApiHandler.getOrder fails', async () => {
      ezManageApiHandler.getOrder.mockRejectedValue(new Error('Fetch failed'));

      await expect(
        service.updateOrder({
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: validInternalOrder,
        }),
      ).rejects.toThrow('Fetch failed');

      expect(ezManageApiHandler.getOrder).toHaveBeenCalledTimes(1);
      expect(crmHandler.updateCRMEntityWithOrder).not.toHaveBeenCalled();
    });

    it('should create a new order if CRM ID is missing', async () => {
      jest.spyOn(service, 'createOrder');

      const orderWithoutCRMID = { ...validInternalOrder, crmId: undefined };
      ezManageApiHandler.getOrder.mockResolvedValue();
    });
  });
});
