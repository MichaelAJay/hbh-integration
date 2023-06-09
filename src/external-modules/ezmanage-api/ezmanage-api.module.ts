import { Module } from '@nestjs/common';
import { CustomLoggerModule } from '../../support-modules/custom-logger/custom-logger.module';
import { EzmanageApiService } from './ezmanage-api.service';
import { GraphqlClientService } from './graphql-client.service';

@Module({
  imports: [CustomLoggerModule],
  providers: [EzmanageApiService, GraphqlClientService],
  exports: [EzmanageApiService, GraphqlClientService],
})
export class ExternalEzmanageApiModule {}
