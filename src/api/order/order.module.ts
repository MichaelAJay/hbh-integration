import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderInternalInterfaceService } from './order-internal-interface.service';
import { OrderModule as InternalOrderModule } from 'src/internal-modules/order/order.module';

@Module({
  imports: [InternalOrderModule],
  controllers: [OrderController],
  providers: [OrderService, OrderInternalInterfaceService],
})
export class OrderModule {}
