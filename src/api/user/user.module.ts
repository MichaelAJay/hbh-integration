import { Module } from '@nestjs/common';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { UserDbService } from './user-db.service';
import { UserService } from './user.service';

@Module({
  imports: [ExternalDatabaseModule],
  providers: [UserService, UserDbService],
})
export class UserModule {}
