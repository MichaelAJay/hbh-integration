import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AuthService,
          useValue: { generateRandomPassword: jest.fn(), hashValue: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('existence tests', () => {});
  describe('generateSaltAndHashedPassword', () => {});

  afterEach(() => jest.resetAllMocks());
});
