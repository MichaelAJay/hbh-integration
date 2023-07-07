import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { GraphqlClientService } from './graphql-client.service';

describe('GraphqlClientService', () => {
  let service: GraphqlClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), CustomLoggerModule],
      providers: [GraphqlClientService],
    }).compile();

    service = module.get<GraphqlClientService>(GraphqlClientService);
  });

  test('service is defined', async () => expect(service).toBeDefined());
});
