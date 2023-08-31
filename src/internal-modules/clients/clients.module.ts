import { Module } from '@nestjs/common';
import { H4HClientService, H4HClientHelperService } from './h4h-client';

@Module({
  providers: [H4HClientService, H4HClientHelperService],
})
export class ClientsModule {}
