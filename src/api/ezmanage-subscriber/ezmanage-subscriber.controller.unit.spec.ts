import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountModule } from 'src/internal-modules/account/account.module';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { EzmanageSubscriberController } from './ezmanage-subscriber.controller';
import { EzmanageSubscriberAPIModule } from './ezmanage-subscriber.module';
import { IEventNotificationPayload } from './interfaces';
import * as request from 'supertest';

describe('EzmanageSubscriberController', () => {
  let controller: EzmanageSubscriberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        AccountModule,
        CustomLoggerModule,
        EzmanageSubscriberAPIModule,
      ],
      controllers: [EzmanageSubscriberController],
    }).compile();

    controller = module.get<EzmanageSubscriberController>(
      EzmanageSubscriberController,
    );
  });

  describe('existence and injection tests', () => {
    test('controller should be defined', () =>
      expect(controller).toBeDefined());
    test('ezManageSubscription service is injected into controller', () =>
      expect(controller.ezManageSubscriberService).toBeDefined());
  });
  describe('handleH4HWebhook', () => {
    it('calls ezManageSubscriberService.handleWebhook with request payload as parameter', async () => {
      const mockPayload: IEventNotificationPayload = {
        parent_type: '',
        parent_id: '',
        entity_type: '',
        entity_id: '',
        key: '',
        occurred_at: '',
      };
      jest
        .spyOn(controller.ezManageSubscriberService, 'handleWebhook')
        .mockResolvedValue();

      await controller.handleH4HWebhook(mockPayload);
      expect(
        controller.ezManageSubscriberService.handleWebhook,
      ).toHaveBeenCalledWith(mockPayload);
    });
    it('returns 201 if ezManageSubscriberService.handleWebhook resolves', async () => {});
    it('propagates any error thrown by ezManageSubscriberService.handleWebhook', async () => {});
  });
  afterEach(() => jest.restoreAllMocks());
});
