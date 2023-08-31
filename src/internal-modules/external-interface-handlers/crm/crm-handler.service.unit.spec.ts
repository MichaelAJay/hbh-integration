import { Test, TestingModule } from '@nestjs/testing';
import { CrmError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { AccountRecordWithId } from '../database/account-db-handler/types';
import { CrmHandlerService } from './crm-handler.service';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';
import { GeneratePrimaryNutshellEntityReturn } from './types/returns';

describe('CrmHandlerService', () => {
  let service: CrmHandlerService;
  let nutshellApiHandler: NutshellApiHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmHandlerService,
        {
          provide: NutshellApiHandlerService,
          useValue: {
            generatePrimaryEntity: jest.fn(),
            updatePrimaryEntityWithOrder: jest.fn(),
            getProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CrmHandlerService>(CrmHandlerService);
    nutshellApiHandler = module.get<NutshellApiHandlerService>(
      NutshellApiHandlerService,
    );
  });

  /**
   * complete
   */
  describe('existence & dependency injection tests', () => {
    test('service exists', () => expect(service).toBeDefined());
    test('nutshell api handler is injected into service', () =>
      expect(nutshellApiHandler).toBeDefined());
  });
  /**
   * WRITTEN & PASSING
   */
  describe('generateCRMEntity', () => {
    describe('switch case "NUTSHELL"', () => {
      it('calls nutshellApiHandler with the correct arguments', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT',
          contactEmail: 'MOCK EMAIL',
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

        const args = {
          account: mockAccount,
          order: mockOrder,
        };

        const mockResult: GeneratePrimaryNutshellEntityReturn = {
          description: 'MOCK DESCRIPTION',
          crmId: 'MOCK CRM ID',
        };

        jest
          .spyOn(nutshellApiHandler, 'generatePrimaryEntity')
          .mockResolvedValue(mockResult);

        await service.generateCRMEntity(args);
        expect(nutshellApiHandler.generatePrimaryEntity).toHaveBeenCalledWith(
          args,
        );
      });
      it('propagates any error thrown by nutshellApiHandler.generatePrimaryEntity', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT',
          contactEmail: 'MOCK EMAIL',
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

        const args = {
          account: mockAccount,
          order: mockOrder,
        };

        const mockError = new Error('ERROR UNDER TEST');

        jest
          .spyOn(nutshellApiHandler, 'generatePrimaryEntity')
          .mockRejectedValue(mockError);

        expect(service.generateCRMEntity(args)).rejects.toThrow(mockError);
      });
      it('returns the result of nutshellApiHandler.generatePrimaryEntity on success', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT',
          contactEmail: 'MOCK EMAIL',
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

        const args = {
          account: mockAccount,
          order: mockOrder,
        };

        const mockResult: GeneratePrimaryNutshellEntityReturn = {
          description: 'MOCK DESCRIPTION',
          crmId: 'MOCK CRM ID',
        };

        jest
          .spyOn(nutshellApiHandler, 'generatePrimaryEntity')
          .mockResolvedValue(mockResult);

        const result = await service.generateCRMEntity(args);
        expect(result).toEqual(mockResult);
      });
    });
    describe('switch case default', () => {
      it('throws CrmError if account.crm is undefined', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT',
          contactEmail: 'MOCK EMAIL',
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

        const args = {
          account: mockAccount,
          order: mockOrder,
        };

        const expectedError = new CrmError(
          'CRM not found for generateCRMEntity',
        );

        expect(service.generateCRMEntity(args)).rejects.toThrow(expectedError);
      });
      it('throws CrmError if account.crm is valid but not supported by switch', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'H4H',
          name: 'MOCK ACCOUNT',
          contactEmail: 'MOCK EMAIL',
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

        const args = {
          account: mockAccount,
          order: mockOrder,
        };

        const expectedError = new CrmError(
          'CRM not found for generateCRMEntity',
        );

        expect(service.generateCRMEntity(args)).rejects.toThrow(expectedError);
      });
    });
  });
  /**
   * STUBBED
   */
  describe('updateCRMEntityWithOrder', () => {
    describe('switch case "NUTSHELL"', () => {
      it('calls nutshellApihandler.updatePrimaryEntityWithOrder with the correct arguments', async () => {});
      it('propagates any error thrown by nutshellApiHandler.updatePrimaryEntityWithOrder', async () => {});
      it('returns an object with { crmDescription: string } on success', async () => {});
    });
    describe('switch case default', () => {
      it('throws CrmError if account.crm is undefined', async () => {});
      it('throws CrmError if account.crm is valid but not supported by switch', async () => {});
    });
  });
  /**
   * STUBBED
   */
  describe('getProducts', () => {
    describe('switch case "NUTSHELL"', () => {
      it('calls nutshellApiHandler.getProducts with the correct arguments', async () => {});
      it('propagates any error thrown by nutshellApiHandler.getProducts', async () => {});
      it('returns the result of nutshellApihandler.getProducts on success', async () => {});
    });
    describe('switch case default', () => {
      it('throws CrmError if account.crm is undefined', async () => {});
      it('throws CrmError if account.crm is valid but not supported by switch', async () => {});
    });
  });
});
