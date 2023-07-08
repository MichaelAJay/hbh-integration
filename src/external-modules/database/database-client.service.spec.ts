import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from './database-client.service';

describe('DatabaseClientService', () => {
  let service: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseClientService],
    }).compile();

    service = module.get<DatabaseClientService>(DatabaseClientService);
  });

  describe('existence tests', () => {
    test('service should be defined', () => expect(service).toBeDefined());
    test('firestore instance should exist on service', () =>
      expect(service.firestore).toBeDefined());
  });
});
