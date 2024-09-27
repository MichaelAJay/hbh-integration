import { Module } from '@nestjs/common';
import { EzmanageApiService } from './ezmanage-api.service';
import { GraphqlClientService } from './graphql-client.service';

@Module({
  providers: [EzmanageApiService, GraphqlClientService],
  exports: [EzmanageApiService, GraphqlClientService],
})
export class ExternalEzmanageApiModule {}
