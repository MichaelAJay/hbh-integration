import { Module } from '@nestjs/common';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { InternalDatabaseModule } from '../external-interface-handlers/database/database.module';
import { AccountService } from './account.service';

@Module({
  imports: [InternalDatabaseModule, CustomLoggerModule],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
