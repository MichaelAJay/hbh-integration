import { Module } from '@nestjs/common';
import { AccountDbHandlerService } from './account-db-handler/account-db-handler.service';
import { UserDbHandlerService } from './user-db-handler/user-db-handler.service';
import { CatererDbHandlerService } from './caterer-db-handler/caterer-db-handler.service';
import { OrderDbHandlerService } from './order-db-handler/order-db-handler.service';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';

@Module({
  imports: [ExternalDatabaseModule],
  providers: [
    AccountDbHandlerService,
    UserDbHandlerService,
    CatererDbHandlerService,
    OrderDbHandlerService,
    DatabaseClientService,
  ],
  exports: [
    AccountDbHandlerService,
    UserDbHandlerService,
    CatererDbHandlerService,
    OrderDbHandlerService,
    DatabaseClientService,
  ],
})
export class InternalDatabaseModule {}
