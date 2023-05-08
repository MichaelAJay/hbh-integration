import { Module } from '@nestjs/common';
import { CatererDbService } from './caterer-db.service';

@Module({
  providers: [CatererDbService],
})
export class CatererModule {}
