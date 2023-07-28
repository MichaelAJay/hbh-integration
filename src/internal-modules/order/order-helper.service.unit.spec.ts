import { Test, TestingModule } from '@nestjs/testing';
import { networkInterfaces } from 'os';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  IOrderModel,
} from 'src/external-modules/database/models';
import { H4HWarnings } from 'src/external-modules/database/models/H4H';
import { OrderHelperService } from './order-helper.service';

describe('OrderHelperService', () => {
  let service: OrderHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderHelperService],
    }).compile();

    service = module.get<OrderHelperService>(OrderHelperService);
  });

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
  });

  describe('generateIOrderModelFromCrmEntity', () => {
    describe('crmEntity is truthy', () => {
      it('calls service tryAppendCrmDataToOrder with the correct arguments', () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };
        const mockCrmEntity = {
          id: 'MOCK CRM ID',
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: true,
        };
        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          ezManageOrderNumber: 'MOCK EZMANAGE ORDER NUMBER',
          status: DbOrderStatus.ACCEPTED,
          crmEntity: mockCrmEntity,
          catererName: 'MOCK CATERER NAME',
        };

        jest.spyOn(service, 'tryAppendCrmDataToOrder');
        service.generateIOrderModelFromCrmEntity(mockArguments);

        expect(service.tryAppendCrmDataToOrder).toHaveBeenCalledWith({
          order: expect.objectContaining({
            accountId: mockArguments.account.id,
            catererId: mockArguments.catererId,
            catererName: mockArguments.catererName,
            name: mockArguments.ezManageOrderNumber,
            status: mockArguments.status,
            acceptedAt: expect.any(Date),
            lastUpdatedAt: expect.any(Date),
          }),
          crmEntity: mockArguments.crmEntity,
        });
      });
      it('propagates any error thrown by service tryAppendCrmDataToOrder', () => {
        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
        };
        const mockCrmEntity = {
          id: 'MOCK CRM ID',
          description: 'MOCK CRM DESCRIPTION',
          isSubtotalMatch: true,
        };
        const mockArguments = {
          account: mockAccount,
          catererId: 'MOCK CATERER ID',
          ezManageOrderNumber: 'MOCK EZMANAGE ORDER NUMBER',
          status: DbOrderStatus.ACCEPTED,
          crmEntity: mockCrmEntity,
          catererName: 'MOCK CATERER NAME',
        };

        const errorMessage = 'ERROR UNDER TEST';

        jest
          .spyOn(service, 'tryAppendCrmDataToOrder')
          .mockImplementation(() => {
            throw new Error(errorMessage);
          });
        expect(() =>
          service.generateIOrderModelFromCrmEntity(mockArguments),
        ).toThrow(errorMessage);
      });
    });
    describe('crmEntity is falsy', () => {
      it('does not call service tryAppendCrmDataToOrder', () => {
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
          ezManageOrderNumber: 'MOCK EZMANAGE ORDER NUMBER',
          status: DbOrderStatus.ACCEPTED,
          crmEntity: undefined,
          catererName: 'MOCK CATERER NAME',
        };

        jest.spyOn(service, 'tryAppendCrmDataToOrder');

        service.generateIOrderModelFromCrmEntity(mockArguments);
        expect(service.tryAppendCrmDataToOrder).not.toHaveBeenCalled();
      });
    });
    it('returns an object which matches the IOrderModel interface', () => {
      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'H4H',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };
      const mockCrmEntity = {
        id: 'MOCK CRM ID',
        description: 'MOCK CRM DESCRIPTION',
        isSubtotalMatch: true,
      };
      const mockArguments = {
        account: mockAccount,
        catererId: 'MOCK CATERER ID',
        ezManageOrderNumber: 'MOCK EZMANAGE ORDER NUMBER',
        status: DbOrderStatus.ACCEPTED,
        crmEntity: mockCrmEntity,
        catererName: 'MOCK CATERER NAME',
      };

      const mockDate = new Date();
      const mockOrder = {
        accountId: mockArguments.account.id,
        catererId: mockArguments.catererId,
        catererName: mockArguments.catererName,
        name: mockArguments.ezManageOrderNumber,
        status: mockArguments.status,
        acceptedAt: mockDate,
        lastUpdatedAt: mockDate,
      };

      const result = service.generateIOrderModelFromCrmEntity(mockArguments);
      expect(result).toEqual({
        ...mockOrder,
        crmId: mockCrmEntity.id,
        crmDescription: mockCrmEntity.description,
      });
    });
  });
  describe('tryAppendCrmDataToOrder', () => {
    it('returns object with crmId, crmDescription, and warnings if incoming crmEntity satisfies all conditions', () => {
      const now = new Date();
      const order: IOrderModel = {
        accountId: 'MOCK ACCOUNT ID',
        catererId: 'MOCK CATERER ID',
        catererName: 'MOCK CATERER NAME',
        name: 'MOCK ORDER NAME',
        status: DbOrderStatus.ACCEPTED,
        acceptedAt: now,
        lastUpdatedAt: now,
      };
      const crmEntity = {
        id: 'MOCK CRM ENTITY ID',
        description: 'MOCK CRM ENTITY DESCRIPTION',
        isSubtotalMatch: false,
      };
      const mockArguments = { order, crmEntity };

      const result = service.tryAppendCrmDataToOrder(mockArguments);
      /** PRIMARY TEST */
      expect(result.crmId).toEqual(crmEntity.id);
      expect(result.crmDescription).toEqual(crmEntity.description);
      expect(result.warnings).toEqual([H4HWarnings.SUBTOTAL_MISMATCH.message]);

      /** COROLLARY TESTS */
      expect(result.accountId).toEqual(order.accountId);
      expect(result.catererId).toEqual(order.catererId);
      expect(result.catererName).toEqual(order.catererName);
      expect(result.name).toEqual(order.name);
      expect(result.status).toEqual(order.status);
      expect(result.acceptedAt).toEqual(order.acceptedAt);
      expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);
    });
    describe('crmEntity is object and not null', () => {
      describe('crmEntity has string "id" property', () => {
        it('returns object with "crmId" string property', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {
            id: 'MOCK CRM ENTITY ID',
            isSubtotalMatch: true,
          };
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.crmId).toEqual(crmEntity.id);

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmDescription).toBeUndefined();
          expect(result.warnings).toBeUndefined();
        });
      });
      describe('crmEntity does NOT have string "id" property', () => {
        it('returns object without "crmId" if crmEntity argument does not have "id" property', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {};
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.crmId).toBeUndefined();

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmDescription).toBeUndefined();
          expect(result.warnings).toBeUndefined();
        });
        it('returns object without "crmId" if crmEntity argument has non-string "id" property', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {
            id: 1234,
            isSubtotalMatch: true,
          };
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.crmId).toBeUndefined();

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmDescription).toBeUndefined();
          expect(result.warnings).toBeUndefined();
        });
      });
      describe('crmEntity has string "description" property', () => {
        it('returns object with "crmDescription" string property', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {
            description: 'MOCK CRM DESCRIPTION',
            isSubtotalMatch: true,
          };
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.crmDescription).toEqual(crmEntity.description);

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmId).toBeUndefined();
          expect(result.warnings).toBeUndefined();
        });
      });
      describe('crmEntity does not have string "description" property', () => {
        it('returns object without "crmDescription" if crmEntity argument does not have "description" property', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {
            isSubtotalMatch: true,
          };
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.crmDescription).toBeUndefined();

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmId).toBeUndefined();
          expect(result.warnings).toBeUndefined();
        });
        it('returns object without "crmDescription" if crmEntity argument "description" is not string', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {
            description: {
              description:
                'MOCK NESTED DESCRIPTION TO MAKE CONDITION RETURN FALSE',
            },
            isSubtotalMatch: true,
          };
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.crmDescription).toBeUndefined();

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmDescription).toBeUndefined();
          expect(result.warnings).toBeUndefined();
        });
      });
      describe('crmEntity.isSubtotalMatch is boolean false', () => {
        it('returns object with "warnings" string array which includes SUBTOTAL_MISMATCH warning', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {
            isSubtotalMatch: false,
          };
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.warnings).toEqual([
            H4HWarnings.SUBTOTAL_MISMATCH.message,
          ]);

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmId).toBeUndefined();
          expect(result.crmDescription).toBeUndefined();
        });
      });
      describe('crmEntity.isSubtotalMatch is not boolean false', () => {
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is undefined', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {};
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.warnings).toBeUndefined();

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmId).toBeUndefined();
          expect(result.crmDescription).toBeUndefined();
        });
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is not boolean type', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {
            isSubtotalMatch: 'false',
          };
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.warnings).toBeUndefined();

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmId).toBeUndefined();
          expect(result.crmDescription).toBeUndefined();
        });
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is true', () => {
          const now = new Date();
          const order: IOrderModel = {
            accountId: 'MOCK ACCOUNT ID',
            catererId: 'MOCK CATERER ID',
            catererName: 'MOCK CATERER NAME',
            name: 'MOCK ORDER NAME',
            status: DbOrderStatus.ACCEPTED,
            acceptedAt: now,
            lastUpdatedAt: now,
          };
          const crmEntity = {
            isSubtotalMatch: true,
          };
          const mockArguments = { order, crmEntity };

          const result = service.tryAppendCrmDataToOrder(mockArguments);
          /** PRIMARY TEST */
          expect(result.warnings).toBeUndefined();

          /** COROLLARY TESTS */
          expect(result.accountId).toEqual(order.accountId);
          expect(result.catererId).toEqual(order.catererId);
          expect(result.catererName).toEqual(order.catererName);
          expect(result.name).toEqual(order.name);
          expect(result.status).toEqual(order.status);
          expect(result.acceptedAt).toEqual(order.acceptedAt);
          expect(result.lastUpdatedAt).toEqual(order.lastUpdatedAt);

          expect(result.crmId).toBeUndefined();
          expect(result.crmDescription).toBeUndefined();
        });
      });
    });
    /**
     * For these tests, just check that the return is the same as the input
     */
    describe('crmEntity is not object or is null', () => {
      /** todo */
      it('returns input order if if crmEntity is not object', () => {
        const now = new Date();
        const order: IOrderModel = {
          accountId: 'MOCK ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: now,
          lastUpdatedAt: now,
        };
        const crmEntity = 'MOCK BAD CRM ENTITY INPUT';
        const mockArguments = { order, crmEntity };

        const result = service.tryAppendCrmDataToOrder(mockArguments);
        /** PRIMARY TEST */
        expect(result).toEqual(mockArguments.order);

        /** COROLLARY TESTS */
        expect(result.crmId).toBeUndefined();
        expect(result.crmDescription).toBeUndefined();
        expect(result.warnings).toBeUndefined();
      });
      /** todo */
      it('returns input order if if crmEntity is null', () => {
        const now = new Date();
        const order: IOrderModel = {
          accountId: 'MOCK ACCOUNT ID',
          catererId: 'MOCK CATERER ID',
          catererName: 'MOCK CATERER NAME',
          name: 'MOCK ORDER NAME',
          status: DbOrderStatus.ACCEPTED,
          acceptedAt: now,
          lastUpdatedAt: now,
        };
        const crmEntity = null;
        const mockArguments = { order, crmEntity };

        const result = service.tryAppendCrmDataToOrder(mockArguments);
        /** PRIMARY TEST */
        expect(result).toEqual(mockArguments.order);

        /** COROLLARY TESTS */
        expect(result.crmId).toBeUndefined();
        expect(result.crmDescription).toBeUndefined();
        expect(result.warnings).toBeUndefined();
      });
    });
  });

  afterEach(() => jest.resetAllMocks());
});
