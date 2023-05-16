import { Test, TestingModule } from '@nestjs/testing';
import { UserInternalInterfaceService } from './user-internal-interface.service';

describe('UserInternalInterfaceService', () => {
  let service: UserInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserInternalInterfaceService],
    }).compile();

    service = module.get<UserInternalInterfaceService>(UserInternalInterfaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
