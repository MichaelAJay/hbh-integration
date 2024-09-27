import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderAPIService } from './order.service';
import { OrderInternalInterfaceService } from './order-internal-interface.service';
import { OrderModule as InternalOrderModule } from 'src/internal-modules/order/order.module';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';

@Module({
  imports: [InternalOrderModule, InternalDatabaseModule],
  controllers: [OrderController],
  providers: [OrderAPIService, OrderInternalInterfaceService],
  exports: [OrderAPIService, OrderInternalInterfaceService],
})
export class OrderAPIModule {}
