import { Test, TestingModule } from '@nestjs/testing';
import { envelopeItemTypeToDataCategory } from '@sentry/utils';
import exp from 'constants';
import { CrmError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { AccountRecordWithId } from '../database/account-db-handler/types';
import { CrmHandlerService } from './crm-handler.service';
import { CrmModule } from './crm.module';
import { GeneratePrimaryNutshellEntityReturn } from './types/returns';

describe('CrmHandlerService', () => {
  let service: CrmHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CrmModule],
      providers: [CrmHandlerService],
    }).compile();

    service = module.get<CrmHandlerService>(CrmHandlerService);
  });

  describe('existence & dependency injection tests', () => {
    test('service exists', () => expect(service).toBeDefined());
    test('nutshell api handler is injected into service', () =>
      expect(service.nutshellApiHandler).toBeDefined());
  });
  describe('generateCRMEntity', () => {
    it('rejects with CrmError if account.crm is undefined', async () => {
      const mockAccount: AccountRecordWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };
      const mockOrder: IEzManageOrder = {
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

      const mockArguments = { account: mockAccount, order: mockOrder };
      await expect(service.generateCRMEntity(mockArguments)).rejects.toThrow(
        new CrmError('CRM not found for generateCRMEntity'),
      );
    });
    it('rejects with CrmError if account.crm not covered in switch', async () => {
      const mockAccount: AccountRecordWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
        crm: 'INVALID CRM',
      };
      const mockOrder: IEzManageOrder = {
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

      const mockArguments = { account: mockAccount, order: mockOrder };
      await expect(service.generateCRMEntity(mockArguments)).rejects.toThrow(
        new CrmError('CRM not found for generateCRMEntity'),
      );
    });
    describe('calls correct method based on account.crm switch case', () => {
      it('calls nutshellApiHandler.generatePrimaryEntity if account.crm is "NUTSHELL"', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
        };
        const mockOrder: IEzManageOrder = {
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
        const mockArguments = { account: mockAccount, order: mockOrder };
        jest
          .spyOn(service.nutshellApiHandler, 'generatePrimaryEntity')
          .mockResolvedValue({} as GeneratePrimaryNutshellEntityReturn);

        await service.generateCRMEntity(mockArguments);
        expect(
          service.nutshellApiHandler.generatePrimaryEntity,
        ).toHaveBeenCalledTimes(1);
      });
    });
    describe('calls switch case method with correct arguments', () => {
      it('calls nutshellApiHandler generatePrimaryEntity with the correct arguments', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
        };
        const mockOrder: IEzManageOrder = {
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
        const mockArguments = { account: mockAccount, order: mockOrder };
        jest
          .spyOn(service.nutshellApiHandler, 'generatePrimaryEntity')
          .mockResolvedValue({} as GeneratePrimaryNutshellEntityReturn);

        await service.generateCRMEntity(mockArguments);
        expect(
          service.nutshellApiHandler.generatePrimaryEntity,
        ).toHaveBeenCalledWith(mockArguments);
      });
    });
    describe('passes through result for each switch case', () => {
      it('passes through result for NUTSHELL case', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
        };
        const mockOrder: IEzManageOrder = {
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
        const mockArguments = { account: mockAccount, order: mockOrder };

        const mockResolvedValue: GeneratePrimaryNutshellEntityReturn = {
          id: 'MOCK CREATED PRIMARY ENTITY ID',
        };
        jest
          .spyOn(service.nutshellApiHandler, 'generatePrimaryEntity')
          .mockResolvedValue(mockResolvedValue);

        const entity = await service.generateCRMEntity(mockArguments);
        expect(entity).toBe(mockResolvedValue);
      });
    });
    describe('propagates error for each switch case', () => {
      it('propagates error for NUTSHELL case', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
        };
        const mockOrder: IEzManageOrder = {
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
        const mockArguments = { account: mockAccount, order: mockOrder };

        const mockRejectedValue = new CrmError('ERROR UNDER TEST');
        jest
          .spyOn(service.nutshellApiHandler, 'generatePrimaryEntity')
          .mockRejectedValue(mockRejectedValue);

        await expect(service.generateCRMEntity(mockArguments)).rejects.toThrow(
          mockRejectedValue,
        );
      });
    });
  });
  describe('updateCRMEntityWithOrder', () => {});
  describe('getProducts', () => {});
});
