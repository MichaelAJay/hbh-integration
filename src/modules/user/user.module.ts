import { Module } from '@nestjs/common';
import { UserDbService } from './user-db.service';
import { UserService } from './user.service';

@Module({
  providers: [UserService, UserDbService],
})
export class UserModule {}
