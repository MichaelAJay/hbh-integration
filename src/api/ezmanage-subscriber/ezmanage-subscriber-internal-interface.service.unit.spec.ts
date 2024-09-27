import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IAccountModelWithId,
  ICatererModelWithId,
} from 'src/external-modules/database/models';
import { AccountService } from 'src/internal-modules/account/account.service';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { EventNotificationPayloadKey } from './enums';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';

describe('EzmanageSubscriberInternalInterfaceService', () => {
  let service: EzmanageSubscriberInternalInterfaceService;
  let accountService: AccountService;
  let orderService: OrderService;
  let orderDbHandler: OrderDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        EzmanageSubscriberInternalInterfaceService,
        {
          provide: AccountService,
          useValue: {
            findAccountByCatererId: jest.fn(),
          },
        },
        {
          provide: OrderService,
          useValue: {
            any: jest.fn(),
          },
        },
        {
          provide: OrderDbHandlerService,
          useValue: {
            any: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EzmanageSubscriberInternalInterfaceService>(
      EzmanageSubscriberInternalInterfaceService,
    );
    accountService = module.get<AccountService>(AccountService);
    orderService = module.get<OrderService>(OrderService);
    orderDbHandler = module.get<OrderDbHandlerService>(OrderDbHandlerService);
  });

  describe('existence and injection tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('accountService is injected into service', () =>
      expect(accountService).toBeDefined());
    test('orderService is injected into service', () =>
      expect(orderService).toBeDefined());
    test('orderDbHandlerService is injected into service', () =>
      expect(orderDbHandler).toBeDefined());
  });

  describe('handleWebhook', () => {
    it('calls accountService.findAccountByCatererId with the correct arguments', async () => {
      const mockArguments = {
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        key: EventNotificationPayloadKey.ACCEPTED,
        occurred_at: 'MOCK TIMESTAMP',
      };

      const mockAccount: IAccountModelWithId = {
        id: 'MOCK ACCOUNT ID',
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
        isActive: true,
        crm: 'NUTSHELL',
        crmPrimaryType: 'LEAD',
        crmUsers: [
          {
            id: 111,
            name: 'MOCK CRM USER NAME',
            assignFor: 'MOCK CRM USER ASSIGN FOR',
          },
        ],
      };
      const mockCaterer: ICatererModelWithId = {
        id: 'MOCK CATERER ID',
        accountId: 'MOCK ACCOUNT ID',
        name: 'MOCK CATERER NAME',
        storeNumber: 'MOCK STORE NUMBER',
      };

      const testTarget = jest
        .spyOn(accountService, 'findAccountByCatererId')
        .mockResolvedValue({
          account: mockAccount,
          caterer: mockCaterer,
        });
      jest.spyOn(service, 'handleOrderAccepted').mockResolvedValue();

      await service.handleWebhook(mockArguments);
      expect(testTarget).toHaveBeenCalledWith(mockArguments.catererId);
    });
    it('propagates any error thrown by accountService.findAccountByCatererId', async () => {
      const mockArguments = {
        catererId: 'MOCK CATERER ID',
        orderId: 'MOCK ORDER ID',
        key: EventNotificationPayloadKey.CANCELLED,
        occurred_at: 'MOCK TIMESTAMP',
      };
      const mockError = new Error('ERROR UNDER TEST');

      jest
        .spyOn(accountService, 'findAccountByCatererId')
        .mockRejectedValue(mockError);

      await expect(service.handleWebhook(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    describe('"key" argument is "cancelled', () => {
      it('calls service handleOrderCancelled with the correct arguments', async () => {
        const mockArguments = {
          catererId: 'MOCK CATERER ID',
          orderId: 'MOCK ORDER ID',
          key: EventNotificationPayloadKey.CANCELLED,
          occurred_at: 'MOCK TIMESTAMP',
        };

        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
          crmPrimaryType: 'LEAD',
          crmUsers: [
            {
              id: 111,
              name: 'MOCK CRM USER NAME',
              assignFor: 'MOCK CRM USER ASSIGN FOR',
            },
          ],
        };
        const mockCaterer: ICatererModelWithId = {
          id: 'MOCK CATERER ID',
          accountId: 'MOCK ACCOUNT ID',
          name: 'MOCK CATERER NAME',
          storeNumber: 'MOCK STORE NUMBER',
        };

        jest.spyOn(accountService, 'findAccountByCatererId').mockResolvedValue({
          account: mockAccount,
          caterer: mockCaterer,
        });
        const testTarget = jest
          .spyOn(service, 'handleOrderCancelled')
          .mockResolvedValue();

        await service.handleWebhook(mockArguments);
        const expectedArguments = {
          account: mockAccount,
          catererId: mockArguments.catererId,
          catererName: mockCaterer.name,
          orderId: mockArguments.orderId,
          occurredAt: mockArguments.occurred_at,
          ref: mockAccount.ref,
        };
        expect(testTarget).toHaveBeenCalledWith(expectedArguments);
      });
      it('propagates any error from service handleOrderCancelled', async () => {
        const mockArguments = {
          catererId: 'MOCK CATERER ID',
          orderId: 'MOCK ORDER ID',
          key: EventNotificationPayloadKey.CANCELLED,
          occurred_at: 'MOCK TIMESTAMP',
        };

        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
          crmPrimaryType: 'LEAD',
          crmUsers: [
            {
              id: 111,
              name: 'MOCK CRM USER NAME',
              assignFor: 'MOCK CRM USER ASSIGN FOR',
            },
          ],
        };
        const mockCaterer: ICatererModelWithId = {
          id: 'MOCK CATERER ID',
          accountId: 'MOCK ACCOUNT ID',
          name: 'MOCK CATERER NAME',
          storeNumber: 'MOCK STORE NUMBER',
        };

        const mockError = new Error('ERROR UNDER TEST');
        jest.spyOn(accountService, 'findAccountByCatererId').mockResolvedValue({
          account: mockAccount,
          caterer: mockCaterer,
        });
        jest
          .spyOn(service, 'handleOrderCancelled')
          .mockRejectedValue(mockError);

        await expect(service.handleWebhook(mockArguments)).rejects.toThrow(
          mockError,
        );
      });
    });
    describe('"key" argument is "accepted"', () => {
      it('calls service handleOrderAccepted with the correct arguments', async () => {
        const mockArguments = {
          catererId: 'MOCK CATERER ID',
          orderId: 'MOCK ORDER ID',
          key: EventNotificationPayloadKey.ACCEPTED,
          occurred_at: 'MOCK TIMESTAMP',
        };

        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
          crmPrimaryType: 'LEAD',
          crmUsers: [
            {
              id: 111,
              name: 'MOCK CRM USER NAME',
              assignFor: 'MOCK CRM USER ASSIGN FOR',
            },
          ],
        };
        const mockCaterer: ICatererModelWithId = {
          id: 'MOCK CATERER ID',
          accountId: 'MOCK ACCOUNT ID',
          name: 'MOCK CATERER NAME',
          storeNumber: 'MOCK STORE NUMBER',
        };

        jest.spyOn(accountService, 'findAccountByCatererId').mockResolvedValue({
          account: mockAccount,
          caterer: mockCaterer,
        });
        const testTarget = jest
          .spyOn(service, 'handleOrderAccepted')
          .mockResolvedValue();

        await service.handleWebhook(mockArguments);
        const expectedArguments = {
          account: mockAccount,
          catererId: mockArguments.catererId,
          catererName: mockCaterer.name,
          orderId: mockArguments.orderId,
          occurredAt: mockArguments.occurred_at,
        };
        expect(testTarget).toHaveBeenCalledWith(expectedArguments);
      });
      it('propagtes any error from service handleOrderAccepted', async () => {
        const mockArguments = {
          catererId: 'MOCK CATERER ID',
          orderId: 'MOCK ORDER ID',
          key: EventNotificationPayloadKey.ACCEPTED,
          occurred_at: 'MOCK TIMESTAMP',
        };

        const mockAccount: IAccountModelWithId = {
          id: 'MOCK ACCOUNT ID',
          ref: 'ADMIN',
          name: 'MOCK ACCOUNT NAME',
          contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
          isActive: true,
          crm: 'NUTSHELL',
          crmPrimaryType: 'LEAD',
          crmUsers: [
            {
              id: 111,
              name: 'MOCK CRM USER NAME',
              assignFor: 'MOCK CRM USER ASSIGN FOR',
            },
          ],
        };
        const mockCaterer: ICatererModelWithId = {
          id: 'MOCK CATERER ID',
          accountId: 'MOCK ACCOUNT ID',
          name: 'MOCK CATERER NAME',
          storeNumber: 'MOCK STORE NUMBER',
        };

        const mockError = new Error('ERROR UNDER TEST');

        jest.spyOn(accountService, 'findAccountByCatererId').mockResolvedValue({
          account: mockAccount,
          caterer: mockCaterer,
        });
        jest.spyOn(service, 'handleOrderAccepted').mockRejectedValue(mockError);
        await expect(service.handleWebhook(mockArguments)).rejects.toThrow(
          mockError,
        );
      });
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
