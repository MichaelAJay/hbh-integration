import { Test, TestingModule } from '@nestjs/testing';
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

  /**
   * complete
   */
  describe('existence & dependency injection tests', () => {
    test('service exists', () => expect(service).toBeDefined());
    test('nutshell api handler is injected into service', () =>
      expect(service.nutshellApiHandler).toBeDefined());
  });
  /**
   * complete
   */
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
  /**
   * complete
   */
  describe('updateCRMEntityWithOrder', () => {
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
      const mockArguments = {
        account: mockAccount,
        order: mockOrder,
        crmEntityId: 'MOCK CRM ENTITY ID',
      };
      await expect(
        service.updateCRMEntityWithOrder(mockArguments),
      ).rejects.toThrow(
        new CrmError(`${mockArguments.account.crm} is not supported.`),
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
      const mockArguments = {
        account: mockAccount,
        order: mockOrder,
        crmEntityId: 'MOCK CRM ENTITY ID',
      };
      await expect(
        service.updateCRMEntityWithOrder(mockArguments),
      ).rejects.toThrow(
        new CrmError(`${mockArguments.account.crm} is not supported.`),
      );
    });
    describe('calls correct method based on account.crm switch case', () => {
      it('calls nutshellApiHandler.updatePrimaryEntityWithOrder for "NUTSHELL" case', async () => {
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

        jest
          .spyOn(service.nutshellApiHandler, 'updatePrimaryEntityWithOrder')
          .mockResolvedValue({ description: 'RESOLVED VALUE DESCRIPTION' });

        const mockArguments = {
          account: mockAccount,
          order: mockOrder,
          crmEntityId: 'MOCK CRM ENTITY ID',
        };
        await service.updateCRMEntityWithOrder(mockArguments);
        expect(
          service.nutshellApiHandler.updatePrimaryEntityWithOrder,
        ).toHaveBeenCalledTimes(1);
      });
    });
    /** make sure to include the optional string[] param */
    describe('switch case methods arguments checks', () => {
      describe('nutshell case arguments checks', () => {
        it('calls nutshellApiHandler updatePrimaryEntityWithOrder with the correct arguments', async () => {
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

          jest
            .spyOn(service.nutshellApiHandler, 'updatePrimaryEntityWithOrder')
            .mockResolvedValue({ description: 'RESOLVED VALUE DESCRIPTION' });

          const mockArguments = {
            account: mockAccount,
            order: mockOrder,
            crmEntityId: 'MOCK CRM ENTITY ID',
          };
          await service.updateCRMEntityWithOrder(mockArguments);
          expect(
            service.nutshellApiHandler.updatePrimaryEntityWithOrder,
          ).toHaveBeenCalledWith({
            account: mockArguments.account,
            order: mockArguments.order,
            primaryEntityId: mockArguments.crmEntityId,
          });
        });
        it('calls nutshellApiHandler updatePrimaryEntityWithOrder with the correct arguments, including optional string[]', async () => {
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

          jest
            .spyOn(service.nutshellApiHandler, 'updatePrimaryEntityWithOrder')
            .mockResolvedValue({ description: 'RESOLVED VALUE DESCRIPTION' });

          const mockArguments = {
            account: mockAccount,
            order: mockOrder,
            crmEntityId: 'MOCK CRM ENTITY ID',
            additionalAndExistingTags: ['OPTIONAL STRING ARRAY'],
          };
          await service.updateCRMEntityWithOrder(mockArguments);
          expect(
            service.nutshellApiHandler.updatePrimaryEntityWithOrder,
          ).toHaveBeenCalledWith({
            account: mockArguments.account,
            order: mockArguments.order,
            primaryEntityId: mockArguments.crmEntityId,
            additionalAndExistingTags: mockArguments.additionalAndExistingTags,
          });
        });
      });
    });
    describe('returns correct result', () => {
      it('returns correct result for NUTSHELL crm', async () => {
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
        const mockResult = { description: 'RESOLVED VALUE DESCRIPTION' };
        jest
          .spyOn(service.nutshellApiHandler, 'updatePrimaryEntityWithOrder')
          .mockResolvedValue(mockResult);

        const mockArguments = {
          account: mockAccount,
          order: mockOrder,
          crmEntityId: 'MOCK CRM ENTITY ID',
        };
        const result = await service.updateCRMEntityWithOrder(mockArguments);
        expect(result).toBeInstanceOf(Object);
        expect(Object.keys(result)).toEqual(['crmDescription']);
        expect(result.crmDescription).toBe(mockResult.description);
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
        const mockError = new CrmError('ERROR UNDER TEST');
        jest
          .spyOn(service.nutshellApiHandler, 'updatePrimaryEntityWithOrder')
          .mockRejectedValue(mockError);

        const mockArguments = {
          account: mockAccount,
          order: mockOrder,
          crmEntityId: 'MOCK CRM ENTITY ID',
        };
        await expect(
          service.updateCRMEntityWithOrder(mockArguments),
        ).rejects.toThrow(mockError);
      });
    });
  });
  /**
   * todo
   */
  describe('getProducts', () => {
    it('rejects with CrmError if account.crm is undefined', async () => {
      const mockAccount: AccountRecordWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT EMAIL',
        isActive: true,
      };
      await expect(
        service.getProducts({ account: mockAccount }),
      ).rejects.toThrow(
        new CrmError(
          `Get products method not defined for CRM ${mockAccount.crm}`,
        ),
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
      await expect(
        service.getProducts({ account: mockAccount }),
      ).rejects.toThrow(
        new CrmError(
          `Get products method not defined for CRM ${mockAccount.crm}`,
        ),
      );
    });
    describe('switch case correct method call check', () => {
      it('calls nutshellApiHandler.getProducts for "NUTSHELL" crm', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
        };
        const mockProducts = {
          mockArg1: 'MOCK VALUE 1',
          mockArg2: 'MOCK VALUE 2',
        };
        jest
          .spyOn(service.nutshellApiHandler, 'getProducts')
          .mockResolvedValue(mockProducts);
        await service.getProducts({ account: mockAccount });
        expect(service.nutshellApiHandler.getProducts).toHaveBeenCalledTimes(1);
      });
    });
    describe('switch case methods arguments check', () => {
      it('calls nutshellApiHandler.getProducts with correct arguments for "NUTSHELL" crm', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
        };
        const mockProducts = {
          mockArg1: 'MOCK VALUE 1',
          mockArg2: 'MOCK VALUE 2',
        };
        jest
          .spyOn(service.nutshellApiHandler, 'getProducts')
          .mockResolvedValue(mockProducts);
        await service.getProducts({ account: mockAccount });
        expect(service.nutshellApiHandler.getProducts).toHaveBeenCalledWith({
          ref: mockAccount.ref,
        });
      });
    });
    describe('return check', () => {
      it('returns result from nutshellApiHandler.getProducts for "NUTSHELL" crm', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
        };
        const mockProducts = {
          mockArg1: 'MOCK VALUE 1',
          mockArg2: 'MOCK VALUE 2',
        };
        jest
          .spyOn(service.nutshellApiHandler, 'getProducts')
          .mockResolvedValue(mockProducts);
        const result = await service.getProducts({ account: mockAccount });
        expect(result).toEqual(mockProducts);
      });
    });
    describe('propagates error for each switch case', () => {
      it('propagates error for "NUTSHELL" case', async () => {
        const mockAccount: AccountRecordWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
        };
        const err = new CrmError('ERROR UNDER TEST');
        jest
          .spyOn(service.nutshellApiHandler, 'getProducts')
          .mockRejectedValue(err);
        await expect(
          service.getProducts({ account: mockAccount }),
        ).rejects.toThrow(err);
      });
    });
  });
});
