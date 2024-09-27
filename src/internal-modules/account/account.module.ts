import { Module } from '@nestjs/common';
import { InternalDatabaseModule } from '../external-interface-handlers/database/database.module';
import { AccountService } from './account.service';

@Module({
  imports: [InternalDatabaseModule],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
