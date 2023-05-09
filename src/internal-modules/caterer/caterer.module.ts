import { Module } from '@nestjs/common';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { CatererDbService } from './caterer-db.service';

@Module({
  imports: [ExternalDatabaseModule],
  providers: [CatererDbService],
})
export class CatererModule {}
