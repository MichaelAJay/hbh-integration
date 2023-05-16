import { Test, TestingModule } from '@nestjs/testing';
import { AdminInternalInterfaceService } from './admin-internal-interface.service';

describe('AdminInternalInterfaceService', () => {
  let service: AdminInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminInternalInterfaceService],
    }).compile();

    service = module.get<AdminInternalInterfaceService>(AdminInternalInterfaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
