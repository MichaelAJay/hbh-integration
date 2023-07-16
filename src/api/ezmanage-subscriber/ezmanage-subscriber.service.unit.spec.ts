import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountModule } from 'src/internal-modules/account/account.module';
import {
  EventNotificationPayloadParentType,
  EventNotificationPayloadEntityType,
  EventNotificationPayloadKey,
} from './enums';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';
import { EzmanageSubscriberAPIService } from './ezmanage-subscriber.service';
import { IEventNotificationPayload } from './interfaces';

describe('EzmanageSubscriberService', () => {
  let service: EzmanageSubscriberAPIService;
  let ezManageInternalInterface: EzmanageSubscriberInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AccountModule],
      providers: [
        EzmanageSubscriberAPIService,
        {
          provide: EzmanageSubscriberInternalInterfaceService,
          useValue: {
            handleWebhook: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EzmanageSubscriberAPIService>(
      EzmanageSubscriberAPIService,
    );
    ezManageInternalInterface =
      module.get<EzmanageSubscriberInternalInterfaceService>(
        EzmanageSubscriberInternalInterfaceService,
      );
  });

  describe('existence & injection tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('ezManageInternalInterface is injected into service', () =>
      expect(ezManageInternalInterface).toBeDefined());
  });

  describe('handleWebhook', () => {
    it('calls ezManageInternalInterface.handleWebhook with the correct arguments', async () => {
      const mockArgument: IEventNotificationPayload = {
        parent_type: EventNotificationPayloadParentType.CATERER,
        parent_id: 'MOCK CATERER ID',
        entity_type: EventNotificationPayloadEntityType.ORDER,
        entity_id: 'MOCK ORDER ID',
        key: EventNotificationPayloadKey.ACCEPTED,
        occurred_at: 'MOCK TIMESTAMP',
      };

      const target = jest
        .spyOn(ezManageInternalInterface, 'handleWebhook')
        .mockResolvedValue();

      await service.handleWebhook(mockArgument);
      expect(target).toHaveBeenCalledWith({
        catererId: mockArgument.parent_id,
        orderId: mockArgument.entity_id,
        key: mockArgument.key,
        occurred_at: mockArgument.occurred_at,
      });
    });
    it('returns void', async () => {
      const mockArgument: IEventNotificationPayload = {
        parent_type: EventNotificationPayloadParentType.CATERER,
        parent_id: 'MOCK CATERER ID',
        entity_type: EventNotificationPayloadEntityType.ORDER,
        entity_id: 'MOCK ORDER ID',
        key: EventNotificationPayloadKey.ACCEPTED,
        occurred_at: 'MOCK TIMESTAMP',
      };

      jest
        .spyOn(ezManageInternalInterface, 'handleWebhook')
        .mockResolvedValue(undefined);

      const result = await service.handleWebhook(mockArgument);
      expect(result).toBeUndefined();
    });
    it('propagates any error thrown by ezManageInternalInterface.handleWebhook', async () => {
      const mockArgument: IEventNotificationPayload = {
        parent_type: EventNotificationPayloadParentType.CATERER,
        parent_id: 'MOCK CATERER ID',
        entity_type: EventNotificationPayloadEntityType.ORDER,
        entity_id: 'MOCK ORDER ID',
        key: EventNotificationPayloadKey.ACCEPTED,
        occurred_at: 'MOCK TIMESTAMP',
      };

      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(ezManageInternalInterface, 'handleWebhook')
        .mockRejectedValue(mockError);

      await expect(service.handleWebhook(mockArgument)).rejects.toThrow(
        mockError,
      );
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
