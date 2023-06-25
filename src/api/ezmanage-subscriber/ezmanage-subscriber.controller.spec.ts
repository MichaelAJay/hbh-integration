import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountModule } from 'src/internal-modules/account/account.module';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { EzmanageSubscriberController } from './ezmanage-subscriber.controller';
import { EzmanageSubscriberAPIModule } from './ezmanage-subscriber.module';

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
