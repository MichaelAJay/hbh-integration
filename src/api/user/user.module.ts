import { Module } from '@nestjs/common';
import { UserAPIService } from './user.service';
import { UserController } from './user.controller';
import { UserInternalInterfaceService } from './user-internal-interface.service';
import { AuthModule } from 'src/internal-modules/auth/auth.module';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';

@Module({
  imports: [AuthModule, InternalDatabaseModule],
  providers: [UserAPIService, UserInternalInterfaceService],
  controllers: [UserController],
  exports: [UserAPIService, UserInternalInterfaceService],
})
export class UserApiModule {}
