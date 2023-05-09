import { Module } from '@nestjs/common';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { AccountService } from './account.service';

@Module({
  imports: [ExternalDatabaseModule],
  providers: [AccountService],
})
export class AccountModule {}
