import { Module } from '@nestjs/common';
import { AdminAPIService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminInternalInterfaceService } from './admin-internal-interface.service';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { UserModule } from 'src/internal-modules/user/user.module';
import { AuthModule } from 'src/internal-modules/auth/auth.module';
import { EzmanageApiHandlerModule } from 'src/internal-modules/external-interface-handlers/ezmanage-api/ezmanage-api-handler.module';
import { AccountModule } from 'src/internal-modules/account/account.module';
import { CrmModule } from 'src/internal-modules/external-interface-handlers/crm/crm.module';
import { OrderModule } from 'src/internal-modules/order/order.module';

@Module({
  imports: [
    InternalDatabaseModule,
    AccountModule,
    UserModule,
    AuthModule,
    EzmanageApiHandlerModule,
    CrmModule,
    OrderModule,
  ],
  providers: [AdminAPIService, AdminInternalInterfaceService],
  controllers: [AdminController],
  exports: [AdminAPIService, AdminInternalInterfaceService],
})
export class AdminAPIModule {}
