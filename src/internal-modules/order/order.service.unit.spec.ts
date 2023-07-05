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
      providers: [OrderService],
    }).compile();

    service = module.get<OrderService>(OrderService);
    crmHandler = module.get(CrmHandlerService);
    ezManageApiHandler = module.get(EzmanageApiHandlerService);
    orderDbService = module.get(OrderDbHandlerService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should call this.generateCRMEntityFromOrder', async () => {
      const generateCRMEntityMockResolvedValue = {
        accountId: 'account123',
        catererId: 'caterer123',
        catererName: 'Caterer Name',
        name: 'Order Number',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      // Test data
      const account: IAccountModelWithId = {
        id: 'account123',
        ref: 'H4H',
        name: '',
        contactEmail: '',
        isActive: true,
      };
      const catererId = 'caterer123';
      const orderId = 'order123';
      const status = DbOrderStatus.ACCEPTED;
      const occurredAt = '2023-06-29T10:00:00Z';
      const catererName = 'Caterer Name';

      const mockGenerateCRMEntity = jest.spyOn(
        service,
        'generateCRMEntityFromOrder',
      );

      jest.spyOn(orderDbService, 'create').mockResolvedValue({});

      mockGenerateCRMEntity.mockResolvedValue(
        generateCRMEntityMockResolvedValue,
      );
      await service.createOrder({
        account,
        catererId,
        orderId,
        status,
        occurredAt,
        catererName,
      });

      expect(mockGenerateCRMEntity).toHaveBeenCalledWith({
        account,
        catererId,
        orderId,
        status,
        occurredAt,
        catererName,
      });
    });

    it('should call orderDbService.create', async () => {
      // Test data
      const account: IAccountModelWithId = {
        id: 'account123',
        ref: 'H4H',
        name: '',
        contactEmail: '',
        isActive: true,
      };
      const catererId = 'caterer123';
      const orderId = 'order123';
      const status = DbOrderStatus.ACCEPTED;
      const occurredAt = '2023-06-29T10:00:00Z';
      const catererName = 'Caterer Name';

      const generateCRMEntityMockResponse = {
        accountId: 'account123',
        catererId: 'caterer123',
        catererName: 'Caterer Name',
        name: 'Order Number',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: new Date(),
        lastUpdatedAt: new Date(),
      };
      const generateCRMEntitySpy = jest.spyOn(
        service,
        'generateCRMEntityFromOrder',
      );
      generateCRMEntitySpy.mockResolvedValue(generateCRMEntityMockResponse);

      jest.spyOn(orderDbService, 'create').mockResolvedValue({});
      await service.createOrder({
        account,
        catererId,
        orderId,
        status,
        occurredAt,
        catererName,
      });

      expect(generateCRMEntitySpy).toHaveBeenCalledWith({
        account,
        catererId,
        orderId,
        status,
        occurredAt,
        catererName,
      });
      expect(orderDbService.create).toHaveBeenCalledWith({
        orderId: 'order123',
        data: expect.objectContaining(generateCRMEntityMockResponse),
      });
    });
  });

  describe('generateCRMEntityFromOrder', () => {
    describe('ezManageApiHandler.getOrder', () => {
      it('should reject with error if no order found by orderId', async () => {
        const mockEzManageApiHandlerGetOrder = jest.spyOn(
          ezManageApiHandler,
          'getOrder',
        );
        mockEzManageApiHandlerGetOrder.mockRejectedValue(
          new NotFoundException('Order not found with id for account'),
        );

        const input = {
          account: validAccount,
          catererId: 'catererId',
          orderId: 'orderId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
        };

        await service.generateCRMEntityFromOrder(input).catch((reason) => {
          expect(reason).toBeInstanceOf(NotFoundException);
          expect(reason.message).toBe('Order not found with id for account');
        });

        expect(mockEzManageApiHandlerGetOrder).toHaveBeenCalledTimes(1);
      });
    });
    describe('crmHandler.generateCrmEntity', () => {});
    describe('crmHandler.updateCRMEntityWithOrder', () => {});
    describe('return', () => {
      it('should return object without crm properites if undefined crm entity', async () => {});
      it('should return object with added crmId and crmDescription property if crm entity', async () => {});
      it('should return object with warnings array on subtotal mismatch', async () => {});
    });
  });

  /**
   * Try mocking the other async methods in updateOrder
   */
  describe('updateOrder', () => {
    describe('no crmId on internalOrder param', () => {
      it('should call createOrder', async () => {
        const mockCreateOrder = jest.spyOn(service, 'createOrder');
        mockCreateOrder.mockResolvedValue();
        const internalOrderWithMissingCrmId = { ...validInternalOrder };
        delete internalOrderWithMissingCrmId.crmId;
        const account = validAccount;
        const catererId = 'catererId';
        const occurredAt = 'occurredAt';
        const catererName = 'catererName';
        const internalOrder = internalOrderWithMissingCrmId;
        await service.updateOrder({
          account,
          catererId,
          occurredAt,
          catererName,
          internalOrder,
        });
        expect(service.createOrder).toHaveBeenCalledWith({
          account,
          catererId,
          orderId: internalOrderWithMissingCrmId.id,
          status: DbOrderStatus.ACCEPTED,
          occurredAt,
          catererName,
        });
      });
    });

    describe('ezManageApiHandler.getOrder', () => {
      /** Need a test to what happens if the request can't be made successfully */
      it('should reject with error if no order found by orderId', async () => {
        const mockEzManageApiHandlerGetOrder = jest.spyOn(
          ezManageApiHandler,
          'getOrder',
        );
        mockEzManageApiHandlerGetOrder.mockRejectedValue(
          new NotFoundException('Order not found with id for account'),
        );

        const input = {
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: validInternalOrder,
        };

        await service.updateOrder(input).catch((reason) => {
          expect(reason).toBeInstanceOf(NotFoundException);
          expect(reason.message).toBe('Order not found with id for account');
        });

        expect(mockEzManageApiHandlerGetOrder).toHaveBeenCalledTimes(1);
      });
      it('should reject with error if response is not object with order property', async () => {
        const mockEzManageApiHandlerGetOrder = jest.spyOn(
          ezManageApiHandler,
          'getOrder',
        );
        mockEzManageApiHandlerGetOrder.mockRejectedValue(
          new UnprocessableEntityException('Malformed GQL response'),
        );

        const input = {
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: validInternalOrder,
        };

        await service.updateOrder(input).catch((reason) => {
          expect(reason).toBeInstanceOf(UnprocessableEntityException);
          expect(reason.message).toBe('Malformed GQL response');
        });

        expect(mockEzManageApiHandlerGetOrder).toHaveBeenCalledTimes(1);
      });
      it('should reject with error if response fails validation', async () => {
        const mockEzManageApiHandlerGetOrder = jest.spyOn(
          ezManageApiHandler,
          'getOrder',
        );
        mockEzManageApiHandlerGetOrder.mockRejectedValue(
          new UnprocessableEntityException('Malformed GQL order response'),
        );

        const input = {
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: validInternalOrder,
        };

        await service.updateOrder(input).catch((reason) => {
          expect(reason).toBeInstanceOf(UnprocessableEntityException);
          expect(reason.message).toBe('Malformed GQL order response');
        });

        expect(mockEzManageApiHandlerGetOrder).toHaveBeenCalledTimes(1);
      });
      it('should call ezManageApiHandler.getOrder once', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue({});
        jest.spyOn(orderDbService, 'updateOne').mockResolvedValue({});
        await service.updateOrder({
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: validInternalOrder,
        });
        expect(ezManageApiHandler.getOrder).toHaveBeenCalledTimes(1);
      });
    });

    describe('crmHandler.updateCRMEntityWithOrder', () => {
      it('should reject with CRM error if account crm not in switch', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockRejectedValue(
            new CrmError(`${validAccount.crm} is not supported.`, true),
          );

        await service
          .updateOrder({
            account: validAccount,
            catererId: 'catererId',
            occurredAt: 'occurredAt',
            catererName: 'catererName',
            internalOrder: validInternalOrder,
          })
          .catch((reason) => {
            expect(reason).toBeInstanceOf(CrmError);
            expect(reason.message).toBe(
              `${validAccount.crm} is not supported.`,
            );
            expect(reason.isLogged).toBe(true);
          });
      });
      it('should reject with CRM error if account crmPrimaryType not in switch', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockRejectedValue(
            new CrmError(
              `${validAccount.crmPrimaryType} crm type is not supported.`,
              true,
            ),
          );

        await service
          .updateOrder({
            account: { ...validAccount, crm: 'NUTSHELL' },
            catererId: 'catererId',
            occurredAt: 'occurredAt',
            catererName: 'catererName',
            internalOrder: validInternalOrder,
          })
          .catch((reason) => {
            expect(reason).toBeInstanceOf(CrmError);
            expect(reason.message).toBe(
              `${validAccount.crmPrimaryType} crm type is not supported.`,
            );
            expect(reason.isLogged).toBe(true);
          });
      });
      it('should reject with OrderManagerError if order is invalid EzManage order', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockRejectedValue(new OrderManagerError('Invalid order', true));

        await service
          .updateOrder({
            account: {
              ...validAccount,
              crm: 'NUTSHELL',
              crmPrimaryType: 'LEAD',
            },
            catererId: 'catererId',
            occurredAt: 'occurredAt',
            catererName: 'catererName',
            internalOrder: validInternalOrder,
          })
          .catch((reason) => {
            expect(reason).toBeInstanceOf(OrderManagerError);
            expect(reason.message).toBe('Invalid order');
            expect(reason.isLogged).toBe(true);
          });
      });
      it('should reject with InternalError if order is account.ref is not in switch', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockRejectedValue(
            new InternalError('Invalid ref INVALID_TEST', true),
          );

        await service
          .updateOrder({
            account: {
              ...validAccount,
              crm: 'NUTSHELL',
              crmPrimaryType: 'LEAD',
              ref: 'INVALID_TEST',
            },
            catererId: 'catererId',
            occurredAt: 'occurredAt',
            catererName: 'catererName',
            internalOrder: validInternalOrder,
          })
          .catch((reason) => {
            expect(reason).toBeInstanceOf(InternalError);
            expect(reason.message).toBe('Invalid ref INVALID_TEST');
            expect(reason.isLogged).toBe(true);
          });
      });
      it('should call crmHandler.updateCRMEntityWithOrder once', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue({});
        jest.spyOn(orderDbService, 'updateOne').mockResolvedValue({});

        await service.updateOrder({
          account: {
            ...validAccount,
            crm: 'NUTSHELL',
            crmPrimaryType: 'LEAD',
            ref: 'INVALID_TEST',
          },
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: validInternalOrder,
        });

        expect(crmHandler.updateCRMEntityWithOrder).toHaveBeenCalledTimes(1);
      });
    });

    describe('orderDbService.updateOne', () => {
      /**
       * Probably going to need to mock updateCRMEntityWithOrder in all the different ways here
       */
      it('should reject if orderId does not correspond to a record in the Order collection', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue({});
        jest
          .spyOn(orderDbService, 'updateOne')
          .mockRejectedValue(
            new InternalError(
              'No matching record found with the provided document id',
              true,
            ),
          );
        const invalidOrderId = '123';
        await service
          .updateOrder({
            account: validAccount,
            catererId: 'catererId',
            occurredAt: 'occurredAt',
            catererName: 'catererName',
            internalOrder: { ...validInternalOrder, id: invalidOrderId },
          })
          .catch((reason) => {
            expect(reason).toBeInstanceOf(InternalError);
            expect(reason.isLogged).toBe(true);
            expect(reason.message).toBe(
              'No matching record found with the provided document id',
            );
          });
      });

      it('should be called once', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue({});
        jest.spyOn(orderDbService, 'updateOne').mockResolvedValue({});

        await service.updateOrder({
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: { ...validInternalOrder },
        });

        expect(orderDbService.updateOne).toBeCalledTimes(1);
      });

      it('should be called with orderId: validInternalOrder.id', async () => {
        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue({});
        jest.spyOn(orderDbService, 'updateOne').mockResolvedValue({});

        await service.updateOrder({
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: { ...validInternalOrder },
        });

        expect(orderDbService.updateOne).toBeCalledWith({
          orderId: validInternalOrder.id,
          updates: expect.objectContaining({ lastUpdatedAt: expect.any(Date) }),
        });
      });

      it('should be called with lastUpdated only if crmHandler.updateCRMEntityWithOrder does not return an object with crmDescription property', async () => {
        const updateResult = {};

        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue(updateResult);
        jest.spyOn(orderDbService, 'updateOne').mockResolvedValue({});

        await service.updateOrder({
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: { ...validInternalOrder },
        });

        expect(orderDbService.updateOne).toBeCalledWith(
          expect.objectContaining({
            orderId: validInternalOrder.id,
            updates: expect.objectContaining({
              lastUpdatedAt: expect.any(Date),
            }),
          }),
        );

        expect(orderDbService.updateOne).toBeCalledWith(
          expect.objectContaining({
            orderId: validInternalOrder.id,
            updates: expect.not.objectContaining({
              crmDescription: expect.anything(),
            }),
          }),
        );
      });

      it('should be called without crmDescription in update if no change from internalOrder', async () => {
        const updateResult = {
          crmDescription: validInternalOrder.crmDescription,
        };

        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue(updateResult);
        jest.spyOn(orderDbService, 'updateOne').mockResolvedValue({});

        await service.updateOrder({
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: { ...validInternalOrder },
        });

        expect(orderDbService.updateOne).toBeCalledWith(
          expect.objectContaining({
            orderId: validInternalOrder.id,
            updates: expect.objectContaining({
              lastUpdatedAt: expect.any(Date),
            }),
          }),
        );

        expect(orderDbService.updateOne).toBeCalledWith(
          expect.objectContaining({
            orderId: validInternalOrder.id,
            updates: expect.not.objectContaining({
              crmDescription: expect.anything(),
            }),
          }),
        );
      });

      it('should be called with crmDescription in update if returned from crmHandler.updateCRMEntityWithOrder and different from internalOrder property', async () => {
        const crmDescription = 'UPDATED DESCRIPTION';
        const updateResult = { crmDescription };

        jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
        jest
          .spyOn(crmHandler, 'updateCRMEntityWithOrder')
          .mockResolvedValue(updateResult);
        jest.spyOn(orderDbService, 'updateOne').mockResolvedValue({});

        await service.updateOrder({
          account: validAccount,
          catererId: 'catererId',
          occurredAt: 'occurredAt',
          catererName: 'catererName',
          internalOrder: { ...validInternalOrder },
        });

        expect(orderDbService.updateOne).toBeCalledWith({
          orderId: validInternalOrder.id,
          updates: expect.objectContaining({
            lastUpdatedAt: expect.any(Date),
            crmDescription,
          }),
        });
      });
    });
  });

  describe('handleCancelledOrder', () => {});

  describe('doesOrderBelongToAccount', () => {});

  describe('getEzManageOrder', () => {});

  describe('getOrderName', () => {});
});
