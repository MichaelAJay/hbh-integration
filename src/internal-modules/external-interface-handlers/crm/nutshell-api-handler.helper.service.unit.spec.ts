import { Test, TestingModule } from '@nestjs/testing';
import { NutshellApiHandlerHelperService } from './nutshell-api-handler.helper.service';

describe('NutshellApiHandlerHelperService', () => {
  let service: NutshellApiHandlerHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutshellApiHandlerHelperService],
    }).compile();

    service = module.get<NutshellApiHandlerHelperService>(NutshellApiHandlerHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
