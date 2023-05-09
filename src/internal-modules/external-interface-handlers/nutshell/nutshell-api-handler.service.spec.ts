import { Test, TestingModule } from '@nestjs/testing';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';

describe('NutshellApiHandlerService', () => {
  let service: NutshellApiHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutshellApiHandlerService],
    }).compile();

    service = module.get<NutshellApiHandlerService>(NutshellApiHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
