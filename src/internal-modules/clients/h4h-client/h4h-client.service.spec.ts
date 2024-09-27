import { Test, TestingModule } from '@nestjs/testing';
import { H4HClientService } from './h4h-client.service';

describe('H4hClientService', () => {
  let service: H4HClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [H4HClientService],
    }).compile();

    service = module.get<H4HClientService>(H4HClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
