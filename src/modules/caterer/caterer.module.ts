import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/support-modules/database/database.module';
import { CatererDbService } from './caterer-db.service';

@Module({
  imports: [DatabaseModule],
  providers: [CatererDbService],
})
export class CatererModule {}
