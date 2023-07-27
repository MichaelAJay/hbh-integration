import { Test, TestingModule } from '@nestjs/testing';
import { networkInterfaces } from 'os';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import { IAccountModelWithId } from 'src/external-modules/database/models';
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
  /**
   * Start here
   */
  describe('tryAppendCrmDataToOrder', () => {
    describe('crmEntity is object and not null', () => {
      it('returns object with "crmId" string property if crmEntity argument has "id" string property', () => {});
      it('returns object without "crmId" if crmEntity argument does not have "id" property', () => {});
      it('returns object without "crmId" if crmEntity argument "id" is not string', () => {});
      it('returns object with "crmDescription" string property if crmEntity argument has "description" string property', () => {});
      it('returns object without "crmDescription" if crmEntity argument does not have "description" property', () => {});
      it('returns object without "crmDescription" if crmEntity argument "description" is not string', () => {});
      describe('crmEntity.isSubtotalMatch is boolean false', () => {
        it('returns object with "warnings" string array', () => {});
      });
      describe('crmEntity.isSubtotalMatch is not boolean false', () => {
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is undefined', () => {});
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is not boolean type', () => {});
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is true', () => {});
      });
    });
    /**
     * For these tests, just check that the return is the same as the input
     */
    describe('crmEntity is not object', () => {});
    describe('crmEntity is null', () => {});
  });

  afterEach(() => jest.resetAllMocks());
});
