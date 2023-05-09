import { Test, TestingModule } from '@nestjs/testing';
import { EzmanageSubscriberController } from './ezmanage-subscriber.controller';

describe('EzmanageSubscriberController', () => {
  let controller: EzmanageSubscriberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EzmanageSubscriberController],
    }).compile();

    controller = module.get<EzmanageSubscriberController>(EzmanageSubscriberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
