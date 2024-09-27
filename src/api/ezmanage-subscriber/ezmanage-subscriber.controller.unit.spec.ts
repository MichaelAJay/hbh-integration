import { UnprocessableEntityException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountModule } from 'src/internal-modules/account/account.module';
import {
  EventNotificationPayloadEntityType,
  EventNotificationPayloadKey,
  EventNotificationPayloadParentType,
} from './enums';
import { EzmanageSubscriberController } from './ezmanage-subscriber.controller';
import { EzmanageSubscriberAPIService } from './ezmanage-subscriber.service';
import { IEventNotificationPayload } from './interfaces';

describe('EzmanageSubscriberController', () => {
  let controller: EzmanageSubscriberController;
  let ezManageSubscriberService: EzmanageSubscriberAPIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AccountModule],
      controllers: [EzmanageSubscriberController],
      providers: [
        {
          provide: EzmanageSubscriberAPIService,
          useValue: {
            handleWebhook: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EzmanageSubscriberController>(
      EzmanageSubscriberController,
    );
    ezManageSubscriberService = module.get<EzmanageSubscriberAPIService>(
      EzmanageSubscriberAPIService,
    );
  });

  describe('existence and injection tests', () => {
    test('controller should be defined', () =>
      expect(controller).toBeDefined());
    test('ezManageSubscription service is injected into controller', () =>
      expect(ezManageSubscriberService).toBeDefined());
  });
  describe('handleH4HWebhook', () => {
    it('calls ezManageSubscriberService.handleWebhook with request payload as parameter', async () => {
      const mockPayload: IEventNotificationPayload = {
        parent_type: EventNotificationPayloadParentType.CATERER,
        parent_id: '',
        entity_type: EventNotificationPayloadEntityType.ORDER,
        entity_id: '',
        key: EventNotificationPayloadKey.ACCEPTED,
        occurred_at: '',
      };
      jest
        .spyOn(ezManageSubscriberService, 'handleWebhook')
        .mockResolvedValue();

      await controller.handleH4HWebhook(mockPayload);
      expect(ezManageSubscriberService.handleWebhook).toHaveBeenCalledWith(
        mockPayload,
      );
    });
    it('propagates any error thrown by ezManageSubscriberService.handleWebhook', async () => {
      const mockPayload: IEventNotificationPayload = {
        parent_type: EventNotificationPayloadParentType.CATERER,
        parent_id: '',
        entity_type: EventNotificationPayloadEntityType.ORDER,
        entity_id: '',
        key: EventNotificationPayloadKey.ACCEPTED,
        occurred_at: '',
      };
      const mockError = new UnprocessableEntityException('ERROR UNDER TEST');
      jest
        .spyOn(ezManageSubscriberService, 'handleWebhook')
        .mockRejectedValue(mockError);
      await expect(controller.handleH4HWebhook(mockPayload)).rejects.toThrow(
        mockError,
      );
    });
  });
  afterEach(() => jest.restoreAllMocks());
});
