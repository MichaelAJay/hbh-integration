import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminInternalInterfaceService } from './admin-internal-interface.service';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { UserModule } from 'src/internal-modules/user/user.module';
import { AuthModule } from 'src/internal-modules/auth/auth.module';
import { NutshellApiHandlerModule } from 'src/internal-modules/external-interface-handlers/nutshell/nutshell-api-handler.module';
import { EzmanageApiHandlerModule } from 'src/internal-modules/external-interface-handlers/ezmanage-api/ezmanage-api-handler.module';
import { AccountModule } from 'src/internal-modules/account/account.module';

@Module({
  imports: [
    InternalDatabaseModule,
    AccountModule,
    UserModule,
    AuthModule,
    NutshellApiHandlerModule,
    EzmanageApiHandlerModule,
  ],
  providers: [AdminService, AdminInternalInterfaceService],
  controllers: [AdminController],
})
export class AdminModule {}
