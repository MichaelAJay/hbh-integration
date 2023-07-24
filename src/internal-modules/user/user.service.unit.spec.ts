import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('existence tests', () => {});
  describe('generateSaltAndHashedPassword', () => {});

  afterEach(() => jest.resetAllMocks());
});
