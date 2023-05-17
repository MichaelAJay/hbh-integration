import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderInternalInterfaceService } from './order-internal-interface.service';
import { OrderModule as InternalOrderModule } from 'src/internal-modules/order/order.module';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';

@Module({
  imports: [InternalOrderModule, InternalDatabaseModule, CustomLoggerModule],
  controllers: [OrderController],
  providers: [OrderService, OrderInternalInterfaceService],
})
export class OrderModule {}
