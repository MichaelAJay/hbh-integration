import { Test, TestingModule } from '@nestjs/testing';
import { H4HClientHelperService } from './h4h-client-helper.service';

describe('H4hClientHelperService', () => {
  let service: H4HClientHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [H4HClientHelperService],
    }).compile();

    service = module.get<H4HClientHelperService>(H4HClientHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
