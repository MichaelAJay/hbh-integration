import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminInternalInterfaceService } from './admin-internal-interface.service';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { UserModule } from 'src/internal-modules/user/user.module';
import { AuthModule } from 'src/internal-modules/auth/auth.module';

@Module({
  imports: [InternalDatabaseModule, UserModule, AuthModule],
  providers: [AdminService, AdminInternalInterfaceService],
  controllers: [AdminController],
})
export class AdminModule {}
