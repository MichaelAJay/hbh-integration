// npx jest --testPathPattern=order.service.unit.spec.ts
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtSecretRequestType } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CrmError, InternalError, OrderManagerError } from 'src/common/classes';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  IOrderModel,
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

  /** Complete (for now - could use error cases on orderDbService.create) */
  describe('createOrder', () => {
    /** Complete */
    describe('ezManageApiHandler.getOrder', () => {
      /** Need a test to what happens if the request can't be made successfully */
      it('should reject with error if no order found by orderId', async () => {
        const now = new Date();
        jest
          .spyOn(ezManageApiHandler, 'getOrder')
          .mockRejectedValue(
            new NotFoundException('Order not found with id for account'),
          );
        jest.spyOn(service, 'generateCRMEntityFromOrder').mockResolvedValue({});
        jest
          .spyOn(service, 'generateIOrderModelFromCrmEntity')
          .mockReturnValue({
            accountId: '',
            catererId: '',
            catererName: '',
            name: '',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          });
        jest.spyOn(orderDbService, 'create').mockResolvedValue({});
        const input = {
          account: validAccount,
          catererId: 'catererId',
          orderId: 'orderId',
          status: DbOrderStatus.ACCEPTED,
          occurredAt: 'occurredAt',
          catererName: 'catererName',
        };
        await service.createOrder(input).catch((reason) => {
          expect(reason).toBeInstanceOf(NotFoundException);
          expect(reason.message).toBe('Order not found with id for account');
        });
        expect(ezManageApiHandler.getOrder).toHaveBeenCalledTimes(1);
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
          orderId: 'orderId',
          status: DbOrderStatus.ACCEPTED,
          occurredAt: 'occurredAt',
          catererName: 'catererName',
        };
        await service.createOrder(input).catch((reason) => {
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
          orderId: 'orderId',
          status: DbOrderStatus.ACCEPTED,
          occurredAt: 'occurredAt',
          catererName: 'catererName',
        };
        await service.createOrder(input).catch((reason) => {
          expect(reason).toBeInstanceOf(UnprocessableEntityException);
          expect(reason.message).toBe('Malformed GQL order response');
        });
        expect(mockEzManageApiHandlerGetOrder).toHaveBeenCalledTimes(1);
      });
      // it('is called with correct arguments', async () => {
      //   const now = new Date();
      //   jest.spyOn(ezManageApiHandler, 'getOrder').mockResolvedValue({});
      //   jest.spyOn(service, 'generateCRMEntityFromOrder').mockResolvedValue({});
      //   jest
      //     .spyOn(service, 'generateIOrderModelFromCrmEntity')
      //     .mockReturnValue({
      //       accountId: '',
      //       catererId: '',
      //       catererName: '',
      //       name: '',
      //       status: DbOrderStatus.ACCEPTED,
      //       acceptedAt: now,
      //       lastUpdatedAt: now,
      //     });
      //   jest.spyOn(orderDbService, 'create').mockResolvedValue({});
      //   const input = {
      //     account: validAccount,
      //     catererId: 'catererId',
      //     orderId: 'orderId',
      //     status: DbOrderStatus.ACCEPTED,
      //     occurredAt: 'occurredAt',
      //     catererName: 'catererName',
      //   };
      //   await service.createOrder(input);
      //   expect(ezManageApiHandler.getOrder).toHaveBeenCalledWith({
      //     orderId: input.orderId,
      //     ref: validAccount.ref,
      //   });
      // });
    });
    // *** CHECK ABOVE ***
    // /** Complete */
    // describe('orderService.generateCRMEntityFromOrder', () => {
    //   it('is called with correct arguments', async () => {
    //     const mockEzManageOrder: IEzManageOrder = {
    //       orderNumber: '45HGZ3',
    //       uuid: 'uuid-1234-5678-91011',
    //       event: {
    //         timestamp: '2023-06-27T10:00:00Z',
    //         timeZoneOffset: '-04:00',
    //         address: {
    //           city: 'Test City',
    //           name: 'Test Name',
    //           state: 'Test State',
    //           street: 'Test Street',
    //           street2: 'Test Street 2',
    //           street3: 'Test Street 3',
    //           zip: '12345',
    //         },
    //         contact: {
    //           name: 'Test Contact',
    //           phone: '123-456-7890',
    //         },
    //       },
    //       orderCustomer: {
    //         firstName: 'Test',
    //         lastName: 'Customer',
    //       },
    //       totals: {
    //         subTotal: { subunits: 2000 },
    //         tip: { subunits: 200 },
    //       },
    //       caterer: {
    //         address: {
    //           city: 'Test City',
    //         },
    //       },
    //       catererCart: {
    //         feesAndDiscounts: [
    //           {
    //             name: 'Test Fee',
    //             cost: { subunits: 200 },
    //           },
    //         ],
    //         orderItems: [
    //           {
    //             quantity: 1,
    //             name: 'Test Item',
    //             totalInSubunits: { subunits: 1000 },
    //             customizations: [
    //               {
    //                 customizationTypeName: 'Test Customization',
    //                 name: 'Test Name',
    //                 quantity: 1,
    //               },
    //             ],
    //           },
    //         ],
    //         totals: {
    //           catererTotalDue: 5000,
    //         },
    //       },
    //       orderSourceType: 'Test Source',
    //     };
    //     jest
    //       .spyOn(ezManageApiHandler, 'getOrder')
    //       .mockResolvedValue(mockEzManageOrder);
    //     jest.spyOn(service, 'generateCRMEntityFromOrder').mockResolvedValue({});
    //     jest.spyOn(service, 'generateIOrderModelFromCrmEntity');
    //     jest.spyOn(orderDbService, 'create').mockResolvedValue({});
    //     const input = {
    //       account: validAccount,
    //       catererId: 'catererId',
    //       orderId: 'orderId',
    //       status: DbOrderStatus.ACCEPTED,
    //       occurredAt: 'occurredAt',
    //       catererName: 'catererName',
    //     };
    //     await service.createOrder(input);
    //     expect(service.generateCRMEntityFromOrder).toHaveBeenCalledWith({
    //       account: input.account,
    //       ezManageOrder: mockEzManageOrder,
    //     });
    //   });
    // });
    // /** Complete */
    // describe('orderService.generateIOrderModelFromCrmEntity', () => {
    //   it('is called with correct arguments', async () => {
    //     const mockEzManageOrder = { orderNumber: 'AAABBB' };
    //     const mockCrmEntity = { id: '123', description: 'Mock crm entity' };
    //     jest
    //       .spyOn(ezManageApiHandler, 'getOrder')
    //       .mockResolvedValue(mockEzManageOrder);
    //     jest
    //       .spyOn(service, 'generateCRMEntityFromOrder')
    //       .mockResolvedValue(mockCrmEntity);
    //     jest.spyOn(service, 'generateIOrderModelFromCrmEntity');
    //     jest.spyOn(orderDbService, 'create').mockResolvedValue({});
    //     const input = {
    //       account: validAccount,
    //       catererId: 'catererId',
    //       orderId: 'orderId',
    //       status: DbOrderStatus.ACCEPTED,
    //       occurredAt: 'occurredAt',
    //       catererName: 'catererName',
    //     };
    //     await service.createOrder(input);
    //     expect(service.generateIOrderModelFromCrmEntity).toHaveBeenCalledWith({
    //       account: input.account,
    //       catererId: input.catererId,
    //       ezManageOrderNumber: mockEzManageOrder.orderNumber,
    //       status: DbOrderStatus.ACCEPTED,
    //       crmEntity: mockCrmEntity,
    //       catererName: input.catererName,
    //     });
    //   });
    // });
    // describe('orderDbService.create', () => {
    //   /**
    //    * @TODO Add error cases
    //    */
    //   it('is called with correct arguments', async () => {
    //     const now = new Date();
    //     const mockOrderModel: IOrderModel = {
    //       accountId: 'acctId123',
    //       catererId: 'catererId123',
    //       catererName: 'caterer name',
    //       name: 'AAABBB',
    //       status: DbOrderStatus.ACCEPTED,
    //       acceptedAt: now,
    //       lastUpdatedAt: now,
    //     };
    //     jest.spyOn(ezManageApiHandler, 'getOrder');
    //     jest.spyOn(service, 'generateCRMEntityFromOrder');
    //     jest
    //       .spyOn(service, 'generateIOrderModelFromCrmEntity')
    //       .mockReturnValue(mockOrderModel);
    //     jest.spyOn(orderDbService, 'create');
    //     const input = {
    //       account: validAccount,
    //       catererId: 'catererId',
    //       orderId: 'orderId',
    //       status: DbOrderStatus.ACCEPTED,
    //       occurredAt: 'occurredAt',
    //       catererName: 'catererName',
    //     };
    //     await service.createOrder(input);
    //     expect(orderDbService.create).toHaveBeenCalledWith({
    //       orderId: input.orderId,
    //       data: mockOrderModel,
    //     });
    //   });
    // });
  });

  describe('generateCRMEntityFromOrder', () => {
    describe('crmHandler.generateCRMEntity', () => {
      it('should call crmHandler.generateCRMEntity with the correct arguments', async () => {
        const mockEzManageOrder: IEzManageOrder = {
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

        jest.spyOn(crmHandler, 'generateCRMEntity').mockResolvedValue({});
        const input = {
          account: validAccount,
          ezManageOrder: mockEzManageOrder,
        };
        await service.generateCRMEntityFromOrder(input);
        expect(crmHandler.generateCRMEntity).toHaveBeenCalledWith({
          account: input.account,
          order: input.ezManageOrder,
        });
      });
      it('should handle an error from crmHandler.generateCrmEntity and return undefined', async () => {});
    });
    describe('crmHandler.updateCRMEntityWithOrder', () => {
      it('should not call crmHandler.updateCrmEntityWithOrder if return from crmHandler.generateCrmEntity does not include isSubtotalMatch', async () => {});
      it('should not call crmHandler.updateCrmEntityWithOrder if return from crmHandler.generateCrmEntity includes isSubtotalMatch = true', async () => {});
      it('should call crmHandler.updateCRMEntityWithOrder if return from crmHandler.generateCrmEntity includes isSubtotalMatch = false', async () => {});
      it('should call crmHandler.updateCRMEntityWithOrder with correct arguments', async () => {});
    });
    describe('return', () => {
      it('should return object without crm properites if undefined crm entity', async () => {});
      it('should return object with added crmId and crmDescription property if crm entity', async () => {});
      it('should return object with warnings array on subtotal mismatch', async () => {});
    });
  });

  describe('generateIOrderModelFromCrmEntity', () => {});

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
