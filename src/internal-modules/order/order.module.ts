import { Module } from '@nestjs/common';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { OrderService } from './order.service';

@Module({
  imports: [ExternalDatabaseModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
