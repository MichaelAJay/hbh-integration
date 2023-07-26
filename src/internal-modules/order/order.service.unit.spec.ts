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
  IOrderModelWithId,
} from 'src/external-modules/database/models';
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
        { provide: CrmHandlerService, useValue: {} },
        { provide: OrderDbHandlerService, useValue: {} },
        { provide: EzmanageApiHandlerService, useValue: {} },
        { provide: OrderHelperService, useValue: {} },
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
   * CHECK
   */
  describe('createOrder', () => {
    it('calls ezManageApiHandler.getOrder with the correct arguments', async () => {});
    it('propagates any error thrown by ezManageApiHandler.getOrder', async () => {});
    it('calls service generateCRMEntityFromOrder with correct arguments', async () => {});
    it('propagates any error thrown by service generateCRMEntityFromOrder', async () => {});
    it('calls service generateIOrderModelFromCrmEntity with correct arguments', async () => {});
    it('propagates any error thrown by service generateIOrderModelFromCrmEntity', async () => {});
    it('calls orderDbService.create with the correct arguments', async () => {});
    it('propagates any error thrown by orderDbService.create', async () => {});
    it('returns void', async () => {});
  });
  /**
   * CHECK
   */
  describe('generateCRMEntityFromOrder', () => {
    it('calls crmHandler.generateCRMEntity with the correct arguments', async () => {});
    it('catches any error thrown by crmHandler.generateCRMEntity and returns undefined instead of throwing error', async () => {});
    describe('crmEntity.isSubtotalMatch is false', () => {
      it('calls crmHandler.updateCRMEntityWithOrder with the correct arguments if no crmEntity.tags', async () => {});
      it('calls crmHandler.updateCRMEntityWithOrder with the correcct arguments if crmEntity.tags', async () => {});
      it('propagates any error thrown by crmHandler.updateCRMEntityWithOrder', async () => {});
    });
    it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.isSubtotalMatch is not a boolean', async () => {});
    it('does not call crmHandler.updateCRMEntityWithOrder if crmEntity.isSubtotalMatch is true', async () => {});
    it('returns crmEntity on success', async () => {});
  });
  /**
   * This is going to be moved to the OrderHelperService
   */
  // describe('generateIOrderModelFromCrmEntity', () => {
  //   describe('crmEntity arg is falsy', () => {
  //     it('returns IOrderModel without crm properties', () => {});
  //   });
  //   describe('crmEntity arg is truthy', () => {
  //     it('returns IOrderModel with crmId string if crmEntity.id is truthy', () => {});
  //     it('returns IOrderModel without crmId string if crmEntity.id is falsy', () => {});
  //     it('returns IOrderModel with crmDescription string if crmEntity.description is truthy', () => {});
  //     it('returns IOrderModel without crmDescription string if crmEntity.description is falsy', () => {});
  //     describe('crmEntity.isSubtotalMatch is boolean false', () => {
  //       it('returns IOrderModel with warnings string array', () => {});
  //     });
  //     describe('crmEntity.isSubtotalMatch is not boolean false', () => {
  //       it('returns IOrderModel without warnings string array', () => {});
  //     });
  //   });
  // });
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
    it('resolves to the return from ezManageApiHandler.getOrderName');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
