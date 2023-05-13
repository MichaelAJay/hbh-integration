import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserInternalInterfaceService } from './user-internal-interface/user-internal-interface.service';
import { AuthModule } from 'src/internal-modules/auth/auth.module';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';

@Module({
  imports: [AuthModule, InternalDatabaseModule],
  providers: [UserService, UserInternalInterfaceService],
  controllers: [UserController],
})
export class UserModule {}
