import { Test, TestingModule } from '@nestjs/testing';
import { UserApiModule } from './user.module';
import { UserAPIService } from './user.service';

describe('UserService', () => {
  let service: UserAPIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserApiModule],
    }).compile();

    service = module.get<UserAPIService>(UserAPIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
