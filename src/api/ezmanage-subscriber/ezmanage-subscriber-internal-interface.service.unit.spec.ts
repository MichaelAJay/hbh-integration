import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IAccountModelWithId,
  ICatererModelWithId,
} from 'src/external-modules/database/models';
import { AccountService } from 'src/internal-modules/account/account.service';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { OrderModule } from 'src/internal-modules/order/order.module';
import { EventNotificationPayloadKey } from './enums';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';

describe('EzmanageSubscriberInternalInterfaceService', () => {
  let service: EzmanageSubscriberInternalInterfaceService;
  let accountService: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), OrderModule, InternalDatabaseModule],
      providers: [
        EzmanageSubscriberInternalInterfaceService,
        {
          provide: AccountService,
          useValue: {
            findAccountByCatererId: jest.fn(),
          },
        },
        {
          provide: 'orderService',
          useValue: {
            any: jest.fn(),
          },
        },
        {
          provide: 'orderDbHandler',
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
  });

  describe('existence and injection tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
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
    it('calls service handleOrderCancelled with the correct arguments if key is "cancelled"', async () => {
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
    it('calls service handleOrderAccepted with the correct arguments if key is "accepted"', async () => {
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
  });

  afterEach(() => jest.restoreAllMocks());
});
