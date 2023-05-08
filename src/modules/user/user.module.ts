import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/support-modules/database/database.module';
import { UserDbService } from './user-db.service';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, UserDbService],
})
export class UserModule {}
