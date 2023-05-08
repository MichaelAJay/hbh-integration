import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/support-modules/database/database.module';
import { OrderDbService } from './order-db.service';

@Module({
  imports: [DatabaseModule],
  providers: [OrderDbService],
  exports: [OrderDbService],
})
export class OrderModule {}
