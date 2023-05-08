import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/support-modules/database/database.module';
import { AccountDbService } from './account-db.service';
import { AccountService } from './account.service';

@Module({
  imports: [DatabaseModule],
  providers: [AccountService, AccountDbService],
})
export class AccountModule {}
