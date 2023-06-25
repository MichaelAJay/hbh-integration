import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderAPIModule } from './order.module';

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), OrderAPIModule],
      controllers: [OrderController],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
